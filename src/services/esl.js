const { logRot, writeFile } = require('./fileSystem.js');
const logger = require('./logger.js');

const PRIMARY_FILE = 'esl_omni_obcheck.txt';
const SECONDARY_FILE = 'esl_omni_obcheck_client.txt';

const DELIMITER = '\r\n';
const SEPARATOR = ',';
const QUOTE = '"';

const LINE1 = '#Automatic upload for backup information to ESL';
const LINE2 = '#Generated by BUR4U-API v1.1 @ ' + new Date().toLocaleString();
const FULL_BACKUP = 0;

const PRIMARY_FIELDS = {
  'System Name': '',
  'Backup Method': 'NetBackup',
  'Backup Name': '',
  'Backup Scheduler': 'NetBackup',
  'Tape Check Time': '15:00',
  'Backup Start Time': '',
  'Backup Type': '',
  'Service Tier': '98%',
  'Scheduling Mon': '',
  'Scheduling Tue': '',
  'Scheduling Wed': '',
  'Scheduling Thu': '',
  'Scheduling Fri': '',
  'Scheduling Sat': '',
  'Scheduling Sun': '',
  'Scheduling On Demand': '1',
  'Restartable?': 'Auto Recovery',
  'Restart Window': '12 h',
  'Backup Device': '',
  'Backup Retention': '',
  'Recovery Instructions': '',
  Comments: '',
};

const SECONDARY_FIELDS = {
  'System Name': '',
  'Backup Method': 'NetBackup',
  'Backup Name': '',
  'Client System Name': '',
};

// Filtering function for clients. If function return "true", client is included.
//   To allow only some names/architectures/OS, use regular expression testing.
//     Example: '!/dev/.test(client.name)' (no "dev" substring in client's name)
//   Default: All clients are included.
const eslClients = (client) => !/excludePattern/i.test(client.name);

// Filtering function for policies. If function return "true", policy is included.
//   To allow only some names, use regular expression testing.
//     Example: '!/dummy|template/i.test(policy.name)' (no "DUMMY/Template" substring (case insensitive) in policy's name)
//   To exclude particular policy type, use numeric value matching.
//     Example: 'policy.policyType!==13' (no "Windows" policies)
//   Default: All active policies except of Dummy/Template/Test are included.
const eslPolicies = (policy) =>
  policy.active === 0 && !/dummy|template|test/i.test(policy.name);

// Filtering function for schedules. If function return "true", schedule is included.
//   To allow only some names, use regular expression testing.
//       Example: '!/forced|user/i.test(schedule.name)' (no "Forced/User" substring (case insensitive) in schedule's name)
//   To exclude particular schedule type, use numeric value matching.
//       Example: 'schedule.scheduleType!==0' (no "Full" backups)
//   Default: All schedules except of Forced/User are included.
const eslSchedules = (schedule) => !/forced|user/i.test(schedule.name);

const backupType = (code) => (code == FULL_BACKUP ? 'Full' : 'Incr');

const startTime = ({ schedule }) =>
  [
    ...new Set([
      schedule.win_mon_start,
      schedule.win_tue_start,
      schedule.win_wed_start,
      schedule.win_thu_start,
      schedule.win_fri_start,
      schedule.win_sat_start,
      schedule.win_sun_start,
    ]),
  ]
    .filter((s) => s > 0)
    .map((s) => new Date(s * 1000).toTimeString().slice(0, 5));

const retLevel = (text) => text.replace(/(ay|eek|onth|ear)s?/i, '');

const primaryEntry = ({ masterServer, policy, schedule }) => {
  const entry = { ...PRIMARY_FIELDS };
  entry['System Name'] = masterServer;
  entry['Backup Name'] = `${policy.name} (${schedule.name})`;
  entry['Backup Start Time'] = `${startTime({ schedule }) || '--:--'}`;
  entry['Backup Type'] = backupType(schedule.backupType);
  entry['Scheduling Mon'] = schedule.win_mon_start ? 1 : 0;
  entry['Scheduling Tue'] = schedule.win_tue_start ? 1 : 0;
  entry['Scheduling Wed'] = schedule.win_wed_start ? 1 : 0;
  entry['Scheduling Thu'] = schedule.win_thu_start ? 1 : 0;
  entry['Scheduling Fri'] = schedule.win_fri_start ? 1 : 0;
  entry['Scheduling Sat'] = schedule.win_sat_start ? 1 : 0;
  entry['Scheduling Sun'] = schedule.win_sun_start ? 1 : 0;
  entry['Backup Device'] = policy.res;
  entry['Backup Retention'] = retLevel(schedule.retLevel);
  return entry;
};
const primary = ({ masterServer, policies }) =>
  policies
    .reduce(
      (entries, policy) => [
        ...entries,
        ...policy.schedules.map((schedule) =>
          Object.values(
            primaryEntry({
              masterServer,
              policy,
              schedule,
            })
          )
            .map((field) => [QUOTE, field, QUOTE].join(''))
            .join(SEPARATOR)
        ),
      ],
      [LINE1, LINE2, Object.keys(PRIMARY_FIELDS).join(SEPARATOR)]
    )
    .join(DELIMITER) + DELIMITER;

const secondaryEntry = ({ masterServer, client, policy, schedule }) => {
  const entry = { ...SECONDARY_FIELDS };
  entry['System Name'] = masterServer;
  entry['Backup Name'] = `${policy.name} (${schedule.name})`;
  entry['Client System Name'] = client.name;
  return entry;
};
const secondary = ({ masterServer, policies }) =>
  policies
    .reduce(
      (entries, policy) => [
        ...entries,
        ...policy.schedules.reduce(
          (entries, schedule) => [
            ...entries,
            ...policy.clients.map((client) =>
              Object.values(
                secondaryEntry({
                  masterServer,
                  client,
                  policy,
                  schedule,
                })
              )
                .map((field) => [QUOTE, field, QUOTE].join(''))
                .join(SEPARATOR)
            ),
          ],
          []
        ),
      ],
      [LINE1, LINE2, Object.keys(SECONDARY_FIELDS).join(SEPARATOR)]
    )
    .join(DELIMITER) + DELIMITER;

const prepareEslData = ([policies, retLevels]) =>
  policies.filter(eslPolicies).map((policy) => ({
    ...policy,
    schedules: policy.schedules.filter(eslSchedules).map((schedule) => ({
      ...schedule,
      retLevel:
        retLevels.find((rl) => rl.level == schedule.retentionLevel)?.period ||
        '',
    })),
    clients: policy.clients.filter(eslClients),
  }));

module.exports = async ({ nbu, outputPath, logRotAt, logRotHistory }) => {
  logger.stdout('ESL export started...');
  try {
    const masterServer = nbu.masterServer;
    const policies = prepareEslData(
      await Promise.all([nbu.policies(), nbu.retentionLevels()])
    );
    if (!policies.length) {
      logger.stdout(`No clients/policies to export.`);
      return 0;
    }
    const count = policies.reduce(
      (count, policy) => {
        count.policies += 1;
        count.clients += policy.clients.length;
        count.schedules += policy.schedules.length;
        return count;
      },
      { policies: 0, clients: 0, schedules: 0 }
    );
    const primaryFile = `${outputPath}/${PRIMARY_FILE}`;
    const secondaryFile = `${outputPath}/${SECONDARY_FILE}`;
    if (logRotAt)
      await Promise.all([
        logRot({ file: primaryFile, time: logRotAt, history: logRotHistory }),
        logRot({ file: secondaryFile, time: logRotAt, history: logRotHistory }),
      ]);
    logger.stdout(
      `Exporting ${count.clients} clients (${count.policies} policies, ${count.schedules} schedules)...`
    );
    await Promise.all([
      writeFile(primaryFile, primary({ masterServer, policies })),
      writeFile(secondaryFile, secondary({ masterServer, policies })),
    ]);
    logger.stdout(`ESL export to "${outputPath}" finished.`);
    return 0;
  } catch (error) {
    logger.stderr(
      `Error ${error.code || error} exporting ESL files. ${error.message || ''}`
    );
    return 1;
  }
};
