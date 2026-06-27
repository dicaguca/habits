const INITIAL_DAILY = {
            workday: '',
            workdayStartNA: false,
            workdayEnd: '',
            workdayEndNA: false,
            mr: { time: '', na: false, count: 0 },
            sdr: { time: '', na: false, count: 0 },
            sleep: { lights: false, tv: false, noLSIB: false, bedtime: false },
            morningHabits: {
                brushTeeth: false,
                faceCare: false,
                pregabalinVitamins: false,
                makeBedCleanRoom: false,
            }
        };

        const INITIAL_PB = {
            moment: false,
            meditation: false,
            stretch: false,
            rooting: false
        };

const MR_MAX_ACTIVITIES_OLD = 14;   // max before the cutoff date
const MR_MAX_ACTIVITIES = 13;       // max from the cutoff date onwards
const MR_MAX_CHANGE_DATE = '2026-06-27'; // first day the new max applies
const SDR_MAX_ACTIVITIES = 9;

export { INITIAL_DAILY, INITIAL_PB, MR_MAX_ACTIVITIES, MR_MAX_ACTIVITIES_OLD, MR_MAX_CHANGE_DATE, SDR_MAX_ACTIVITIES };






