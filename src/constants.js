const INITIAL_DAILY = {
            workday: '',
            workdayEnd: '',
            isWeekend: false,
            mr: { time: '', na: false, count: 0 },
            sdr: { time: '', count: 0 },
            sleep: { lights: false, tv: false, noLSIB: false, bedtime: false },
            morningHabits: {
                brushTeeth: false,
                faceCare: false,
                pregabalinVitamins: false,
                makeBedCleanRoom: false,
                pdmJournal: false,
            }
        };

        const INITIAL_PB = {
            moment: false,
            meditation: false,
            stretch: false,
            rooting: false
        };

export { INITIAL_DAILY, INITIAL_PB };



