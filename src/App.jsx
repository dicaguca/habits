import { useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_DAILY, INITIAL_PB } from './constants';
import { Icons, Modal, NumberInput, ProgressBar, SimpleBarChart, StackedBar, Toggle } from './components/ui';

function App() {
            // Get today's date in local timezone
            const getLocalDateString = (dateObj = new Date()) => {
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const [selectedDate, setSelectedDate] = useState(getLocalDateString());
            const [activeTab, setActiveTab] = useState('morning');
            const [showReview, setShowReview] = useState(false);
            const [showComparison, setShowComparison] = useState(false);
            const [showWeekly, setShowWeekly] = useState(false);
            const getSundayDate = (d) => {
                const date = new Date(d);
                const day = date.getDay();
                const diff = date.getDate() - day;
                return new Date(date.setDate(diff));
            };

            const [showGoals, setShowGoals] = useState(false);
            const [goalsTab, setGoalsTab] = useState('morning');
            const [currentGoalsWeekStart, setCurrentGoalsWeekStart] = useState(() => getSundayDate(getLocalDateString()));
            const [showRulesModal, setShowRulesModal] = useState(false);
            const [trendsTab, setTrendsTab] = useState('morning');

            // --- INITIAL STATE ---
            const [dailyLogs, setDailyLogs] = useState(() => {
                const saved = JSON.parse(localStorage.getItem('habits-daily'));
                return saved || {};
            });
            const [pbLogs, setPbLogs] = useState(() => {
                const saved = JSON.parse(localStorage.getItem('habits-pb'));
                return saved || {};
            });
            const [weeklyGoals, setWeeklyGoals] = useState(() => {
                const saved = JSON.parse(localStorage.getItem('habits-weekly-goals'));
                return saved || {};
            });
            const CLOUD_SYNC_URL = 'https://api.sadhanas.app/habits';
            const [syncStatus, setSyncStatus] = useState('Cloud sync ready');
            const [isSyncing, setIsSyncing] = useState(false);
            const cloudLoadedRef = useRef(false);
            const cloudSaveTimerRef = useRef(null);
            const cloudSyncStartedRef = useRef(false);
            const goalsScrollRef = useRef(null);

            const [showExportModal, setShowExportModal] = useState(false);
            const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
            const [reviewMonth, setReviewMonth] = useState(new Date().toISOString().slice(0, 7));
            const [reviewTab, setReviewTab] = useState('morning');

            useEffect(() => localStorage.setItem('habits-daily', JSON.stringify(dailyLogs)), [dailyLogs]);
            useEffect(() => localStorage.setItem('habits-pb', JSON.stringify(pbLogs)), [pbLogs]);
            useEffect(() => localStorage.setItem('habits-weekly-goals', JSON.stringify(weeklyGoals)), [weeklyGoals]);
            const getCloudPayload = () => ({
                dailyLogs,
                pbLogs,
                weeklyGoals,
                updatedAt: new Date().toISOString(),
            });

            const isCloudDataEmpty = (data) => (
                !data ||
                Object.keys(data?.dailyLogs || {}).length === 0 &&
                Object.keys(data?.pbLogs || {}).length === 0 &&
                Object.keys(data?.weeklyGoals || {}).length === 0
            );

            const saveToCloud = async (payload = getCloudPayload(), { manual = false } = {}) => {
                try {
                    if (manual) setIsSyncing(true);
                    setSyncStatus('Saving to Cloudflare...');
                    const response = await fetch(CLOUD_SYNC_URL, {
                        method: 'PUT',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    const result = await response.json().catch(() => ({}));
                    if (!response.ok) throw new Error(result.error || 'Cloud save failed');

                    setSyncStatus(`Saved to Cloudflare ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                    return true;
                } catch (error) {
                    setSyncStatus(`Cloud save failed: ${error.message}`);
                    return false;
                } finally {
                    if (manual) setIsSyncing(false);
                }
            };

            const loadFromCloud = async ({ saveIfEmpty = false, manual = false } = {}) => {
                try {
                    if (manual) setIsSyncing(true);
                    setSyncStatus('Loading from Cloudflare...');
                    const response = await fetch(CLOUD_SYNC_URL);

                    const data = await response.json().catch(() => null);
                    if (!response.ok) throw new Error(data?.error || 'Cloud load failed');

                    if (isCloudDataEmpty(data)) {
                        cloudLoadedRef.current = true;
                        setSyncStatus('Cloud was empty; saving this browser copy...');
                        if (saveIfEmpty) await saveToCloud(getCloudPayload());
                        return true;
                    }

                    setDailyLogs(data.dailyLogs || {});
                    setPbLogs(data.pbLogs || {});
                    setWeeklyGoals(data.weeklyGoals || {});
                    cloudLoadedRef.current = true;
                    setSyncStatus(`Loaded from Cloudflare${data.updatedAt ? ` ${new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`);
                    return true;
                } catch (error) {
                    cloudLoadedRef.current = false;
                    setSyncStatus(`Cloud load failed: ${error.message}`);
                    return false;
                } finally {
                    if (manual) setIsSyncing(false);
                }
            };

            useEffect(() => {
                if (cloudSyncStartedRef.current) return;
                cloudSyncStartedRef.current = true;
                loadFromCloud({ saveIfEmpty: true });
            }, []);

            useEffect(() => {
                if (!cloudLoadedRef.current) return;

                if (cloudSaveTimerRef.current) clearTimeout(cloudSaveTimerRef.current);
                cloudSaveTimerRef.current = setTimeout(() => {
                    saveToCloud();
                }, 1000);

                return () => {
                    if (cloudSaveTimerRef.current) clearTimeout(cloudSaveTimerRef.current);
                };
            }, [dailyLogs, pbLogs, weeklyGoals]);
            const getTheme = () => {
                if (activeTab === 'morning') return {
                    bg: 'bg-gradient-to-br from-brand-yellow/20 via-brand-orange/10 to-brand-salmon/20',
                    accent: 'from-brand-orange to-brand-salmon',
                };
                if (activeTab === 'night') return {
                    bg: 'bg-gradient-to-br from-brand-periwinkle/20 via-brand-purple/10 to-brand-blue/20',
                    accent: 'from-brand-purple to-brand-blue',
                };
                if (activeTab === 'sadhanas') return {
                    bg: 'bg-gradient-to-br from-brand-periwinkle/20 via-brand-teal/10 to-brand-purple/20',
                    accent: 'from-brand-periwinkle to-brand-purple',
                };
            };
            const theme = getTheme();

            const selectedDailyLog = dailyLogs[selectedDate] || {};
            const currentDaily = {
                ...INITIAL_DAILY,
                ...selectedDailyLog,
                mr: { ...INITIAL_DAILY.mr, ...(selectedDailyLog.mr || {}) },
                sdr: { ...INITIAL_DAILY.sdr, ...(selectedDailyLog.sdr || {}) },
                sleep: { ...INITIAL_DAILY.sleep, ...(selectedDailyLog.sleep || {}) },
                morningHabits: { ...INITIAL_DAILY.morningHabits, ...(selectedDailyLog.morningHabits || {}) },
                workdayStartNA: selectedDailyLog.workdayStartNA ?? selectedDailyLog.isWeekend ?? INITIAL_DAILY.workdayStartNA,
            };
            const currentPB = pbLogs[selectedDate] || INITIAL_PB;
            const squareIconButtonClass = 'bg-white hover:bg-stone-50 text-stone-700 w-12 h-12 rounded-xl shadow-sm border border-stone-200 flex items-center justify-center transition-all';
            const sectionCardClass = 'glass p-6 rounded-3xl border border-white/60 shadow-xl';

            const updateDaily = (updates) => {
                setDailyLogs(prev => ({
                    ...prev,
                    [selectedDate]: { ...(prev[selectedDate] || INITIAL_DAILY), ...updates }
                }));
            };

            const updatePB = (updates) => {
                setPbLogs(prev => ({
                    ...prev,
                    [selectedDate]: { ...(prev[selectedDate] || INITIAL_PB), ...updates }
                }));
            };

            const shiftDate = (days) => {
                // Safely construct date from YYYY-MM-DD components to avoid timezone related day shifts
                const parts = selectedDate.split('-').map(Number);
                const d = new Date(parts[0], parts[1] - 1, parts[2]); // YYYY, M-1, D

                // Apply the shift
                d.setDate(d.getDate() + days);

                setSelectedDate(getLocalDateString(d));
            };

            // Parse date in local timezone to avoid UTC conversion issues
            const [year, month, day] = selectedDate.split('-').map(Number);
            const displayDate = new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

            // Calculate Today and Yesterday strings in local timezone
            const now = new Date();
            const todayStr = getLocalDateString(now);
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = getLocalDateString(yesterday);

            // --- DATA ANALYSIS ---

            const timeStrToMinutes = (t) => {
                if (!t || typeof t !== 'string' || !t.includes(':')) return null;
                const [h, m] = t.split(':').map(Number);
                if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
                return h * 60 + m;
            };

            const minutesToTimeStr = (mins) => {
                if (!Number.isFinite(mins) || mins <= 0) return '--:--';
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                return `${h}:${String(m).padStart(2, '0')}`;
            };

            const MORNING_ROUTINE_EARLY_CUTOFF = (9 * 60) + 50;
            const WORKDAY_START_EARLY_CUTOFF = (10 * 60) + 10;
            const SHUTDOWN_ROUTINE_EARLY_CUTOFF = (22 * 60) + 45;
            const WORKDAY_END_EARLY_CUTOFF = 22 * 60;

            const getMorningRoutineMinutes = (log) => log?.mr?.na ? null : timeStrToMinutes(log?.mr?.time);
            const isMorningRoutineDone = (log) => !log?.mr?.na && (getMorningRoutineMinutes(log) !== null || Boolean(log?.mr?.done));
            const isMorningRoutineEarly = (log) => {
                const mins = getMorningRoutineMinutes(log);
                if (mins !== null) return mins < MORNING_ROUTINE_EARLY_CUTOFF;
                return Boolean(log?.mr?.early);
            };
            const getMorningRoutineStatus = (log) => isMorningRoutineDone(log) ? (isMorningRoutineEarly(log) ? 'early' : 'late') : null;
            const getMorningRoutineDisplay = (log) => {
                if (getMorningRoutineMinutes(log) !== null) {
                    return isMorningRoutineEarly(log) ? 'EARLY ' + log.mr.time : 'LATE ' + log.mr.time;
                }
                if (!log?.mr?.na && log?.mr?.done) {
                    return log?.mr?.early ? 'EARLY' : 'DONE';
                }
                return 'NO';
            };

            const getWorkdayStartMinutes = (log) => (log?.workdayStartNA ?? log?.isWeekend) ? null : timeStrToMinutes(log?.workday);
            const isWorkdayStartDone = (log) => getWorkdayStartMinutes(log) !== null;
            const isWorkdayStartEarly = (log) => {
                const mins = getWorkdayStartMinutes(log);
                return mins !== null ? mins < WORKDAY_START_EARLY_CUTOFF : false;
            };
            const getWorkdayStartStatus = (log) => isWorkdayStartDone(log) ? (isWorkdayStartEarly(log) ? 'early' : 'late') : null;

            const getShutdownRoutineMinutes = (log) => timeStrToMinutes(log?.sdr?.time);
            const isShutdownRoutineDone = (log) => !log?.sdr?.na && (getShutdownRoutineMinutes(log) !== null || Boolean(log?.sdr?.done));
            const isShutdownRoutineEarly = (log) => {
                const mins = getShutdownRoutineMinutes(log);
                if (mins !== null) return mins < SHUTDOWN_ROUTINE_EARLY_CUTOFF;
                return Boolean(log?.sdr?.early);
            };
            const getShutdownRoutineStatus = (log) => isShutdownRoutineDone(log) ? (isShutdownRoutineEarly(log) ? 'early' : 'late') : null;
            const getShutdownRoutineDisplay = (log) => {
                if (log?.sdr?.na) return 'N/A';
                if (getShutdownRoutineMinutes(log) !== null) {
                    return isShutdownRoutineEarly(log) ? 'EARLY ' + log.sdr.time : 'LATE ' + log.sdr.time;
                }
                if (log?.sdr?.done) {
                    return log?.sdr?.early ? 'EARLY' : 'DONE';
                }
                return 'NO';
            };

            const getWorkdayEndMinutes = (log) => timeStrToMinutes(log?.workdayEnd);
            const isWorkdayEndDone = (log) => !log?.workdayEndNA && getWorkdayEndMinutes(log) !== null;
            const isWorkdayEndEarly = (log) => {
                const mins = getWorkdayEndMinutes(log);
                return mins !== null ? mins < WORKDAY_END_EARLY_CUTOFF : false;
            };
            const getWorkdayEndStatus = (log) => isWorkdayEndDone(log) ? (isWorkdayEndEarly(log) ? 'early' : 'late') : null;

            const statusBadge = (status, { earlyLabel = '\u{1F426} Early Bird', lateLabel = 'Late', earlyClass = 'bg-brand-yellow/30 text-stone-700', lateClass = 'bg-brand-orange/30 text-stone-700' } = {}) => {
                if (!status) return null;
                const label = status === 'early' ? earlyLabel : lateLabel;
                const colorClass = status === 'early' ? earlyClass : lateClass;
                return <span className={`text-xs ${colorClass} px-2 py-1 rounded-md font-bold`}>{label}</span>;
            };
            const calculateTrends = () => {
                const allDates = [...new Set([...Object.keys(dailyLogs), ...Object.keys(pbLogs)])];
                const months = [...new Set(allDates.map(d => d.slice(0, 7)))].sort();

                return months.map(m => {
                    const dailyDates = Object.keys(dailyLogs).filter(d => d.startsWith(m));
                    const pbDates = Object.keys(pbLogs).filter(d => d.startsWith(m));
                    const totalDailyDays = dailyDates.length || 1;
                    const totalPbDays = pbDates.length || 1;

                    let mrCount = 0, mrEarlyCount = 0, sdrCount = 0, sdrEarlyCount = 0;
                    let workdayStartCount = 0, workdayStartEarlyCount = 0, workdayEndCount = 0, workdayEndEarlyCount = 0;
                    let mrCompletionTimes = [], sdrCompletionTimes = [];
                    let mrTotalActs = 0, sdrTotalActs = 0;

                    let lightsCount = 0, tvCount = 0, lsibCount = 0, bedCount = 0;
                    let brushTeethCount = 0, faceCareCount = 0, pregabalinVitaminsCount = 0, makeBedCleanRoomCount = 0;

                    dailyDates.forEach(d => {
                        const log = dailyLogs[d];
                        if (isMorningRoutineDone(log)) {
                            mrCount++;
                            if (isMorningRoutineEarly(log)) mrEarlyCount++;
                            const mrMinutes = getMorningRoutineMinutes(log);
                            if (mrMinutes !== null) mrCompletionTimes.push(mrMinutes);
                            mrTotalActs += (log.mr.count || 0);
                        }
                        if (isShutdownRoutineDone(log)) {
                            sdrCount++;
                            if (isShutdownRoutineEarly(log)) sdrEarlyCount++;
                            const sdrMinutes = getShutdownRoutineMinutes(log);
                            if (sdrMinutes !== null) sdrCompletionTimes.push(sdrMinutes);
                            sdrTotalActs += (log.sdr.count || 0);
                        }
                        if (isWorkdayStartDone(log)) {
                            workdayStartCount++;
                            if (isWorkdayStartEarly(log)) workdayStartEarlyCount++;
                        }
                        if (isWorkdayEndDone(log)) {
                            workdayEndCount++;
                            if (isWorkdayEndEarly(log)) workdayEndEarlyCount++;
                        }
                        if (log?.sleep?.lights) lightsCount++;
                        if (log?.sleep?.tv) tvCount++;
                        if (log?.sleep?.noLSIB) lsibCount++;
                        if (log?.sleep?.bedtime) bedCount++;
                        if (log?.morningHabits?.brushTeeth) brushTeethCount++;
                        if (log?.morningHabits?.faceCare) faceCareCount++;
                        if (log?.morningHabits?.pregabalinVitamins) pregabalinVitaminsCount++;
                        if (log?.morningHabits?.makeBedCleanRoom) makeBedCleanRoomCount++;
                    });

                    const workdayTimes = dailyDates
                        .map(d => dailyLogs[d])
                        .map(log => getWorkdayStartMinutes(log))
                        .filter(v => v !== null);

                    const workdayAvgMin = workdayTimes.length
                        ? Math.round(workdayTimes.reduce((a, b) => a + b, 0) / workdayTimes.length)
                        : 0;

                    const workdayEndTimes = dailyDates
                        .map(d => dailyLogs[d])
                        .map(log => getWorkdayEndMinutes(log))
                        .filter(v => v !== null);

                    const workdayEndAvgMin = workdayEndTimes.length
                        ? Math.round(workdayEndTimes.reduce((a, b) => a + b, 0) / workdayEndTimes.length)
                        : 0;

                    const mrCompletionAvgMin = mrCompletionTimes.length
                        ? Math.round(mrCompletionTimes.reduce((a, b) => a + b, 0) / mrCompletionTimes.length)
                        : 0;

                    const sdrCompletionAvgMin = sdrCompletionTimes.length
                        ? Math.round(sdrCompletionTimes.reduce((a, b) => a + b, 0) / sdrCompletionTimes.length)
                        : 0;

                    let momentCount = 0, meditationCount = 0, stretchCount = 0, rootingCount = 0;
                    pbDates.forEach(d => {
                        const log = pbLogs[d];
                        if (log?.moment) momentCount++;
                        if (log?.meditation) meditationCount++;
                        if (log?.stretch) stretchCount++;
                        if (log?.rooting) rootingCount++;
                    });

                    const shortMonth = new Date(m + '-02').toLocaleDateString('en-US', { month: 'short' });

                    return {
                        label: shortMonth,
                        workdayAvgMin,
                        workdayEndAvgMin,
                        workdayEarly: Math.round((workdayStartEarlyCount / totalDailyDays) * 100),
                        workdayEndEarly: Math.round((workdayEndEarlyCount / totalDailyDays) * 100),
                        mrCompletionAvgMin,
                        sdrCompletionAvgMin,
                        mr: Math.round((mrCount / totalDailyDays) * 100),
                        mrEarly: Math.round((mrEarlyCount / totalDailyDays) * 100),
                        mrAvg: Math.round(mrTotalActs / totalDailyDays),
                        sdr: Math.round((sdrCount / totalDailyDays) * 100),
                        sdrEarly: Math.round((sdrEarlyCount / totalDailyDays) * 100),
                        sdrAvg: Math.round(sdrTotalActs / totalDailyDays),
                        lights: Math.round((lightsCount / totalDailyDays) * 100),
                        tv: Math.round((tvCount / totalDailyDays) * 100),
                        lsib: Math.round((lsibCount / totalDailyDays) * 100),
                        bedtime: Math.round((bedCount / totalDailyDays) * 100),
                        brushTeeth: Math.round((brushTeethCount / totalDailyDays) * 100),
                        faceCare: Math.round((faceCareCount / totalDailyDays) * 100),
                        pregabalinVitamins: Math.round((pregabalinVitaminsCount / totalDailyDays) * 100),
                        makeBedCleanRoom: Math.round((makeBedCleanRoomCount / totalDailyDays) * 100),
                        moment: Math.round((momentCount / totalPbDays) * 100),
                        meditation: Math.round((meditationCount / totalPbDays) * 100),
                        stretch: Math.round((stretchCount / totalPbDays) * 100),
                        rooting: Math.round((rootingCount / totalPbDays) * 100),
                    };
                });
            };
            const trends = useMemo(() => calculateTrends(), [dailyLogs, pbLogs]);

            const getReviewStats = (month) => {
                const dailyDates = Object.keys(dailyLogs).filter(d => d.startsWith(month));
                const pbDates = Object.keys(pbLogs).filter(d => d.startsWith(month));
                const daysInMonth = new Date(month.split('-')[0], month.split('-')[1], 0).getDate();
                const totalDays = dailyDates.length > 0 ? dailyDates.length : daysInMonth;

                const workdayTimes = dailyDates
                    .map(d => getWorkdayStartMinutes(dailyLogs[d]))
                    .filter(v => v !== null);
                const avgWorkday = workdayTimes.length > 0
                    ? Math.round(workdayTimes.reduce((a, b) => a + b, 0) / workdayTimes.length)
                    : 0;
                const avgWorkdayStr = minutesToTimeStr(avgWorkday);

                const workdayEndTimes = dailyDates
                    .map(d => getWorkdayEndMinutes(dailyLogs[d]))
                    .filter(v => v !== null);
                const avgWorkdayEnd = workdayEndTimes.length > 0
                    ? Math.round(workdayEndTimes.reduce((a, b) => a + b, 0) / workdayEndTimes.length)
                    : 0;
                const avgWorkdayEndStr = minutesToTimeStr(avgWorkdayEnd);

                const mrCompletionTimes = dailyDates
                    .map(d => getMorningRoutineMinutes(dailyLogs[d]))
                    .filter(v => v !== null);
                const avgMrCompletion = mrCompletionTimes.length > 0
                    ? Math.round(mrCompletionTimes.reduce((a, b) => a + b, 0) / mrCompletionTimes.length)
                    : 0;
                const avgMrCompletionStr = minutesToTimeStr(avgMrCompletion);

                const sdrCompletionTimes = dailyDates
                    .map(d => getShutdownRoutineMinutes(dailyLogs[d]))
                    .filter(v => v !== null);
                const avgSdrCompletion = sdrCompletionTimes.length > 0
                    ? Math.round(sdrCompletionTimes.reduce((a, b) => a + b, 0) / sdrCompletionTimes.length)
                    : 0;
                const avgSdrCompletionStr = minutesToTimeStr(avgSdrCompletion);

                const mrEarly = dailyDates.filter(d => getMorningRoutineStatus(dailyLogs[d]) === 'early').length;
                const mrLate = dailyDates.filter(d => getMorningRoutineStatus(dailyLogs[d]) === 'late').length;
                const workdayStartEarly = dailyDates.filter(d => getWorkdayStartStatus(dailyLogs[d]) === 'early').length;
                const workdayStartLate = dailyDates.filter(d => getWorkdayStartStatus(dailyLogs[d]) === 'late').length;
                const sdrEarly = dailyDates.filter(d => getShutdownRoutineStatus(dailyLogs[d]) === 'early').length;
                const sdrLate = dailyDates.filter(d => getShutdownRoutineStatus(dailyLogs[d]) === 'late').length;
                const workdayEndEarly = dailyDates.filter(d => getWorkdayEndStatus(dailyLogs[d]) === 'early').length;
                const workdayEndLate = dailyDates.filter(d => getWorkdayEndStatus(dailyLogs[d]) === 'late').length;

                let lights = 0, tv = 0, lsib = 0, bed = 0;
                let morningHabits = { brushTeeth: 0, faceCare: 0, pregabalinVitamins: 0, makeBedCleanRoom: 0 };
                dailyDates.forEach(d => {
                    const log = dailyLogs[d];
                    if (log?.sleep?.lights) lights++;
                    if (log?.sleep?.tv) tv++;
                    if (log?.sleep?.noLSIB) lsib++;
                    if (log?.sleep?.bedtime) bed++;
                    if (log?.morningHabits?.brushTeeth) morningHabits.brushTeeth++;
                    if (log?.morningHabits?.faceCare) morningHabits.faceCare++;
                    if (log?.morningHabits?.pregabalinVitamins) morningHabits.pregabalinVitamins++;
                    if (log?.morningHabits?.makeBedCleanRoom) morningHabits.makeBedCleanRoom++;
                });

                let pbCounts = { moment: 0, meditation: 0, stretch: 0, rooting: 0 };
                pbDates.forEach(d => {
                    const l = pbLogs[d];
                    if (l.moment) pbCounts.moment++;
                    if (l.meditation) pbCounts.meditation++;
                    if (l.stretch) pbCounts.stretch++;
                    if (l.rooting) pbCounts.rooting++;
                });

                return {
                    avgWorkdayStr, avgWorkdayEndStr, avgMrCompletionStr, avgSdrCompletionStr, totalDays,
                    mr: { early: mrEarly, late: mrLate },
                    workdayStart: { early: workdayStartEarly, late: workdayStartLate },
                    sdr: { early: sdrEarly, late: sdrLate },
                    workdayEnd: { early: workdayEndEarly, late: workdayEndLate },
                    sleep: { lights, tv, lsib, bed },
                    morningHabits,
                    pb: pbCounts
                };
            };            const reviewStats = getReviewStats(reviewMonth);

            const generateMarkdown = (type) => {
                const dates = Object.keys(type === 'daily' ? dailyLogs : pbLogs)
                    .filter(d => d.startsWith(exportMonth))
                    .sort();
                if (dates.length === 0) return `No data found for ${exportMonth}`;
                const monthName = new Date(exportMonth + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                if (type === 'daily') {
                    let md = `### Daily Habits Tracker - ${monthName}\n\n`;
                    md += `| Date | Workday | MR Time | MR # | SDR | SDR # | Sleep lights | Sleep TV | No LSIB | Bedtime |\n|---|---|---|---|---|---|---|---|---|---|\n`;
                    dates.forEach(date => {
                        const l = dailyLogs[date];
                        const dateStr = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        md += `| ${dateStr} | ${(l.workdayStartNA ?? l.isWeekend) ? 'N/A' : (l.workday || '')} | ${getMorningRoutineDisplay(l)} | ${l.mr.count > 0 ? l.mr.count + '/14' : ''} | ${getShutdownRoutineDisplay(l)} | ${l.sdr.count > 0 ? l.sdr.count + '/9' : ''} | ${l.sleep.lights ? 'YES' : 'NO'} | ${l.sleep.tv ? 'YES' : 'NO'} | ${l.sleep.noLSIB ? 'YES' : 'NO'} | ${l.sleep.bedtime ? 'YES' : 'NO'} |\n`;
                    });
                    return md;
                } else {
                    let md = `### Sadhanas - ${monthName}\n\n`;
                    md += `| Date | Moment | Meditation | Stretch/Walk | Rooting |\n|---|---|---|---|---|\n`;
                    dates.forEach(date => {
                        const l = pbLogs[date];
                        const dateStr = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        md += `| ${dateStr} | ${l.moment ? '☑️' : '❌'} | ${l.meditation ? '☑️' : '❌'} | ${l.stretch ? '☑️' : '❌'} | ${l.rooting ? '☑️' : '❌'} |\n`;
                    });
                    return md;
                }
            };

            const downloadFile = (content, filename, type = 'text/markdown') => {
                const blob = new Blob([content], { type });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
            };

            const handleBackup = () => {
                const backup = { dailyLogs, pbLogs, weeklyGoals, date: new Date().toISOString() };
                downloadFile(JSON.stringify(backup, null, 2), `habits_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
            };

            const handleRestore = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
                        if (data.pbLogs) setPbLogs(data.pbLogs);
                        alert('Data imported successfully!');
                        setShowExportModal(false);
                    } catch (err) { alert('Invalid backup file'); }
                };
                reader.readAsText(file);
            };

            // --- WEEKLY DASHBOARD SCREEN ---
            const WeeklyScreen = () => {
                const getSunday = (d) => {
                    const date = new Date(d);
                    const day = date.getDay();
                    const diff = date.getDate() - day;
                    return new Date(date.setDate(diff));
                };

                const [currentWeekStart, setCurrentWeekStart] = useState(() => getSunday(selectedDate));
                const [weeklyTab, setWeeklyTab] = useState('morning');

                const weekDates = useMemo(() => {
                    const days = [];
                    const start = new Date(currentWeekStart);
                    for (let i = 0; i < 7; i++) {
                        const d = new Date(start);
                        d.setDate(start.getDate() + i);
                        days.push(getLocalDateString(d));
                    }
                    return days;
                }, [currentWeekStart]);

                const weekLabel = useMemo(() => {
                    const end = new Date(currentWeekStart);
                    end.setDate(end.getDate() + 6);
                    const opt = { month: 'short', day: 'numeric' };
                    return `${currentWeekStart.toLocaleDateString('en-US', opt)} - ${end.toLocaleDateString('en-US', opt)}`;
                }, [currentWeekStart]);

                const weekWorkdayTimes = weekDates
                    .map(d => dailyLogs[d])
                    .map(log => getWorkdayStartMinutes(log))
                    .filter(v => v !== null);

                const weekWorkdayAvgMin = weekWorkdayTimes.length
                    ? Math.round(weekWorkdayTimes.reduce((a, b) => a + b, 0) / weekWorkdayTimes.length)
                    : 0;

                const weekWorkdayAvgStr = minutesToTimeStr(weekWorkdayAvgMin);

                const weekWorkdayEndTimes = weekDates
                    .map(d => dailyLogs[d])
                    .map(log => getWorkdayEndMinutes(log))
                    .filter(v => v !== null);

                const weekWorkdayEndAvgMin = weekWorkdayEndTimes.length
                    ? Math.round(weekWorkdayEndTimes.reduce((a, b) => a + b, 0) / weekWorkdayEndTimes.length)
                    : 0;

                const weekWorkdayEndAvgStr = minutesToTimeStr(weekWorkdayEndAvgMin);

                const weekMrCompletionTimes = weekDates
                    .map(d => dailyLogs[d])
                    .map(log => getMorningRoutineMinutes(log))
                    .filter(v => v !== null);

                const weekMrCompletionAvgMin = weekMrCompletionTimes.length
                    ? Math.round(weekMrCompletionTimes.reduce((a, b) => a + b, 0) / weekMrCompletionTimes.length)
                    : 0;

                const weekMrCompletionAvgStr = minutesToTimeStr(weekMrCompletionAvgMin);

                const weekSdrCompletionTimes = weekDates
                    .map(d => dailyLogs[d])
                    .map(log => getShutdownRoutineMinutes(log))
                    .filter(v => v !== null);

                const weekSdrCompletionAvgMin = weekSdrCompletionTimes.length
                    ? Math.round(weekSdrCompletionTimes.reduce((a, b) => a + b, 0) / weekSdrCompletionTimes.length)
                    : 0;

                const weekSdrCompletionAvgStr = minutesToTimeStr(weekSdrCompletionAvgMin);

                const shiftWeek = (weeks) => {
                    const newStart = new Date(currentWeekStart);
                    newStart.setDate(newStart.getDate() + (weeks * 7));
                    setCurrentWeekStart(newStart);
                };

                const WeeklyRow = ({ label, dates, logs, checkFn, colorClass, emptyClass = "bg-stone-100 border-stone-200", isRitual = false, dataKey = "" }) => (
                    <div className="flex items-center justify-between py-4 border-b border-stone-100 last:border-0">
                        <span className="font-bold text-stone-600 text-sm w-32 md:w-48 truncate pr-2">{label}</span>
                        <div className="flex gap-1 md:gap-3 flex-1 justify-between max-w-md">
                            {dates.map((date) => {
                                const log = logs[date] || (weeklyTab === 'sadhanas' ? INITIAL_PB : INITIAL_DAILY);
                                const status = checkFn(log);

                                let boxClass = emptyClass;
                                let content = null;

                                if (isRitual) {
                                    const count = (log[dataKey] && log[dataKey].count) || 0;

                                    if (status === 'early') {
                                        boxClass = `bg-${colorClass} border-${colorClass}`;
                                        if (count > 0) content = <span className="text-white font-bold text-xs">{count}</span>;
                                    } else if (status === 'late' || status === true) {
                                        boxClass = `bg-${colorClass}/40 border-${colorClass}`;
                                        if (count > 0) content = <span className={`text-${colorClass} font-bold text-xs brightness-50`}>{count}</span>;
                                    }
                                } else if (status === 'late' || status === true) {
                                    boxClass = `bg-${colorClass} border-${colorClass}`;
                                }

                                return (
                                    <div key={date} className="flex flex-col items-center gap-1">
                                        <div
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 transition-all flex items-center justify-center ${boxClass} ${status ? 'shadow-sm' : ''}`}
                                            title={date}
                                        >
                                            {content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

                return (
                    <div className="fixed inset-0 bg-stone-50 z-50 overflow-y-auto animate-fade-in">
                        <div className="max-w-5xl mx-auto px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-36">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-3xl shadow-sm border border-stone-200">
                                <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                                    <span className="bg-brand-mint/20 text-brand-mint p-2 rounded-xl"><Icons.Calendar /></span>
                                    Weekly Dashboard
                                </h2>

                                <div className="flex items-center gap-4 bg-stone-100 p-1 rounded-xl">
                                    <button onClick={() => shiftWeek(-1)} className="p-2 hover:bg-white rounded-lg transition-all"><Icons.ChevronLeft /></button>
                                    <span className="font-bold text-stone-600 min-w-[140px] text-center">{weekLabel}</span>
                                    <button onClick={() => shiftWeek(1)} className="p-2 hover:bg-white rounded-lg transition-all"><Icons.ChevronRight /></button>
                                </div>

                                <button onClick={() => setShowWeekly(false)} className="bg-stone-200 hover:bg-stone-300 p-2 rounded-full transition-colors text-stone-500 absolute top-4 right-4 md:static"><Icons.X /></button>
                            </div>

                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setWeeklyTab('morning')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${weeklyTab === 'morning' ? 'bg-brand-orange text-white shadow-md' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
                                >
                                    Morning
                                </button>
                                <button
                                    onClick={() => setWeeklyTab('night')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${weeklyTab === 'night' ? 'bg-brand-purple text-white shadow-md' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
                                >
                                    Night
                                </button>
                                <button
                                    onClick={() => setWeeklyTab('sadhanas')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${weeklyTab === 'sadhanas' ? 'bg-brand-periwinkle text-white shadow-md' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
                                >
                                    Sadhanas
                                </button>
                            </div>

                            {(weeklyTab === 'morning' || weeklyTab === 'night') && (
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-stone-50 rounded-2xl p-4">
                                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                                {weeklyTab === 'morning' ? 'Avg MR Completed' : 'Avg SDR Completed'}
                                            </div>
                                            <div className="text-3xl font-extrabold text-stone-800 mt-2">
                                                {weeklyTab === 'morning' ? weekMrCompletionAvgStr : weekSdrCompletionAvgStr}
                                            </div>
                                            <div className="text-sm text-stone-400 font-bold mt-1">
                                                Based on {(weeklyTab === 'morning' ? weekMrCompletionTimes.length : weekSdrCompletionTimes.length)} logged time{(weeklyTab === 'morning' ? weekMrCompletionTimes.length : weekSdrCompletionTimes.length) === 1 ? '' : 's'}
                                            </div>
                                        </div>

                                        <div className="bg-stone-50 rounded-2xl p-4">
                                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                                {weeklyTab === 'morning' ? 'Avg Workday Start' : 'Avg Workday End'}
                                            </div>
                                            <div className="text-3xl font-extrabold text-stone-800 mt-2">
                                                {weeklyTab === 'morning' ? weekWorkdayAvgStr : weekWorkdayEndAvgStr}
                                            </div>
                                            <div className="text-sm text-stone-400 font-bold mt-1">
                                                Based on {(weeklyTab === 'morning' ? weekWorkdayTimes.length : weekWorkdayEndTimes.length)} logged time{(weeklyTab === 'morning' ? weekWorkdayTimes.length : weekWorkdayEndTimes.length) === 1 ? '' : 's'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                                <div className="flex items-center justify-between pr-0 md:pr-2 pb-4 border-b border-stone-100">
                                    <span className="w-32 md:w-48" aria-hidden="true"></span>
                                    <div className="flex gap-1 md:gap-3 flex-1 justify-between max-w-md">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                            <div key={i} className="w-8 md:w-10 text-center font-bold text-stone-400 uppercase text-xs">{d}</div>
                                        ))}
                                    </div>
                                </div>

                                {weeklyTab === 'morning' && (
                                    <div className="space-y-1 pt-3">
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] pt-2 pb-1">Morning Routine</div>
                                        <WeeklyRow label="MR Completed" dates={weekDates} logs={dailyLogs} isRitual={true} dataKey="mr" checkFn={l => getMorningRoutineStatus(l)} colorClass="brand-orange" />
                                        <WeeklyRow label="Workday Start" dates={weekDates} logs={dailyLogs} isRitual={true} checkFn={l => getWorkdayStartStatus(l)} colorClass="brand-mint" />
                                        <div className="border-t border-dashed border-stone-200 my-2"></div>
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] pt-2 pb-1">Habits</div>
                                        <WeeklyRow label="Brush teeth" dates={weekDates} logs={dailyLogs} checkFn={l => l.morningHabits?.brushTeeth} colorClass="brand-orange" />
                                        <WeeklyRow label="Face-care routine" dates={weekDates} logs={dailyLogs} checkFn={l => l.morningHabits?.faceCare} colorClass="brand-yellow" />
                                        <WeeklyRow label="Pregabalin & vitamins" dates={weekDates} logs={dailyLogs} checkFn={l => l.morningHabits?.pregabalinVitamins} colorClass="brand-pink" />
                                        <WeeklyRow label="Make bed & clean room" dates={weekDates} logs={dailyLogs} checkFn={l => l.morningHabits?.makeBedCleanRoom} colorClass="brand-teal" />
                                    </div>
                                )}
                                {weeklyTab === 'night' && (
                                    <div className="space-y-1 pt-3">
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] pt-2 pb-1">Shutdown Routine</div>
                                        <WeeklyRow label="SDR Completed" dates={weekDates} logs={dailyLogs} isRitual={true} dataKey="sdr" checkFn={l => getShutdownRoutineStatus(l)} colorClass="brand-purple" />
                                        <WeeklyRow label="Workday End" dates={weekDates} logs={dailyLogs} isRitual={true} checkFn={l => getWorkdayEndStatus(l)} colorClass="brand-blue" />
                                        <div className="border-t border-dashed border-stone-200 my-2"></div>
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] pt-2 pb-1">Habits</div>
                                        <WeeklyRow label="Sleep Lights Off" dates={weekDates} logs={dailyLogs} checkFn={l => l.sleep?.lights} colorClass="brand-yellow" />
                                        <WeeklyRow label="No TV / Sound" dates={weekDates} logs={dailyLogs} checkFn={l => l.sleep?.tv} colorClass="brand-blue" />
                                        <WeeklyRow label="No Late Snacks" dates={weekDates} logs={dailyLogs} checkFn={l => l.sleep?.noLSIB} colorClass="brand-mint" />
                                        <WeeklyRow label="Bedtime < 12" dates={weekDates} logs={dailyLogs} checkFn={l => l.sleep?.bedtime} colorClass="brand-salmon" />
                                    </div>
                                )}
                                {weeklyTab === 'sadhanas' && (
                                    <div className="space-y-1 pt-3">
                                        <WeeklyRow label="Morning Moment" dates={weekDates} logs={pbLogs} checkFn={l => l.moment} colorClass="brand-yellow" />
                                        <WeeklyRow label="Meditation" dates={weekDates} logs={pbLogs} checkFn={l => l.meditation} colorClass="brand-pink" />
                                        <WeeklyRow label="Stretch / Walk" dates={weekDates} logs={pbLogs} checkFn={l => l.stretch} colorClass="brand-teal" />
                                        <WeeklyRow label="Rooting" dates={weekDates} logs={pbLogs} checkFn={l => l.rooting} colorClass="brand-purple" />
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 text-center text-stone-400 text-xs font-bold uppercase tracking-widest">
                                Tip: Faded boxes indicate "Late" completion. Numbers indicate # of activities.
                            </div>
                        </div>
                    </div>
                );
            };

            // --- WEEKLY GOALS SCREEN ---
            const WeeklyGoalsScreen = () => {
                const currentWeekStart = currentGoalsWeekStart;
                const setCurrentWeekStart = setCurrentGoalsWeekStart;

                const weekDates = (() => {
                    const days = [];
                    const start = new Date(currentWeekStart);
                    for (let i = 0; i < 7; i++) {
                        const d = new Date(start);
                        d.setDate(start.getDate() + i);
                        days.push(getLocalDateString(d));
                    }
                    return days;
                })();

                const weekKey = getLocalDateString(currentWeekStart);
                const weekGoals = weeklyGoals[weekKey] || {};

                const weekLabel = (() => {
                    const end = new Date(currentWeekStart);
                    end.setDate(end.getDate() + 6);
                    const opt = { month: 'short', day: 'numeric' };
                    return `${currentWeekStart.toLocaleDateString('en-US', opt)} - ${end.toLocaleDateString('en-US', opt)}`;
                })();

                const shiftWeek = (weeks) => {
                    const newStart = new Date(currentWeekStart);
                    newStart.setDate(newStart.getDate() + (weeks * 7));
                    setCurrentWeekStart(newStart);
                };

                const countDaily = (checkFn) => weekDates.filter(date => checkFn(dailyLogs[date] || INITIAL_DAILY)).length;
                const countPb = (checkFn) => weekDates.filter(date => checkFn(pbLogs[date] || INITIAL_PB)).length;

                const goalSections = {
                    morning: [
                        { key: 'mrEarly', label: 'MR Completed Early', actual: countDaily(log => getMorningRoutineStatus(log) === 'early'), color: 'from-brand-orange to-brand-salmon' },
                        { key: 'workdayStartEarly', label: 'Workday Start Early', actual: countDaily(log => getWorkdayStartStatus(log) === 'early'), color: 'from-brand-mint to-brand-teal' },
                        { key: 'brushTeeth', label: 'Brush teeth', actual: countDaily(log => log.morningHabits?.brushTeeth), color: 'from-brand-orange to-brand-salmon' },
                        { key: 'faceCare', label: 'Face-care routine', actual: countDaily(log => log.morningHabits?.faceCare), color: 'from-brand-yellow to-brand-orange' },
                        { key: 'pregabalinVitamins', label: 'Pregabalin & vitamins', actual: countDaily(log => log.morningHabits?.pregabalinVitamins), color: 'from-brand-salmon to-brand-pink' },
                        { key: 'makeBedCleanRoom', label: 'Make bed & clean room', actual: countDaily(log => log.morningHabits?.makeBedCleanRoom), color: 'from-brand-mint to-brand-teal' },
                    ],
                    night: [
                        { key: 'sdrEarly', label: 'SDR Completed Early', actual: countDaily(log => getShutdownRoutineStatus(log) === 'early'), color: 'from-brand-purple to-brand-periwinkle' },
                        { key: 'workdayEndEarly', label: 'Workday End Early', actual: countDaily(log => getWorkdayEndStatus(log) === 'early'), color: 'from-brand-blue to-brand-periwinkle' },
                        { key: 'sleepLights', label: 'Sleep Lights Off', actual: countDaily(log => log.sleep?.lights), color: 'from-brand-yellow to-brand-orange' },
                        { key: 'noTv', label: 'No TV / Soundscapes', actual: countDaily(log => log.sleep?.tv), color: 'from-brand-blue to-brand-periwinkle' },
                        { key: 'noLateSnacks', label: 'No Late Snacks', actual: countDaily(log => log.sleep?.noLSIB), color: 'from-brand-mint to-brand-teal' },
                        { key: 'bedtime', label: 'Bedtime < Midnight', actual: countDaily(log => log.sleep?.bedtime), color: 'from-brand-purple to-brand-periwinkle' },
                    ],
                    sadhanas: [
                        { key: 'moment', label: 'Morning Moment', actual: countPb(log => log.moment), color: 'from-brand-yellow to-brand-orange' },
                        { key: 'meditation', label: 'Meditation', actual: countPb(log => log.meditation), color: 'from-brand-salmon to-brand-pink' },
                        { key: 'stretch', label: 'Stretch / Walk', actual: countPb(log => log.stretch), color: 'from-brand-mint to-brand-teal' },
                        { key: 'rooting', label: 'Rooting', actual: countPb(log => log.rooting), color: 'from-brand-purple to-brand-periwinkle' },
                    ],
                };

                const activeGoals = goalSections[goalsTab];
                const allGoals = Object.values(goalSections).flat();
                const totalTarget = allGoals.reduce((sum, goal) => sum + (Number(weekGoals[goal.key]) || 0), 0);
                const totalCompleted = allGoals.reduce((sum, goal) => {
                    const target = Number(weekGoals[goal.key]) || 0;
                    return sum + (target > 0 ? Math.min(goal.actual, target) : 0);
                }, 0);
                const totalProgressPct = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
                const goalsSet = activeGoals.filter(goal => (Number(weekGoals[goal.key]) || 0) > 0).length;
                const goalsMet = activeGoals.filter(goal => {
                    const target = Number(weekGoals[goal.key]) || 0;
                    return target > 0 && goal.actual >= target;
                }).length;
                const updateGoal = (goalKey, value) => {
                    const target = Math.max(0, Math.min(7, Number(value) || 0));
                    const scrollTop = goalsScrollRef.current?.scrollTop || 0;
                    setWeeklyGoals(prev => ({
                        ...prev,
                        [weekKey]: {
                            ...(prev[weekKey] || {}),
                            [goalKey]: target,
                        },
                    }));
                    requestAnimationFrame(() => {
                        if (goalsScrollRef.current) goalsScrollRef.current.scrollTop = scrollTop;
                    });
                };

                const GoalRow = ({ goal }) => {
                    const target = Number(weekGoals[goal.key]) || 0;
                    const progress = target > 0 ? Math.min(100, Math.round((goal.actual / target) * 100)) : 0;
                    const isMet = target > 0 && goal.actual >= target;

                    return (
                        <div className={`rounded-2xl border-2 p-4 transition-all ${isMet ? 'border-brand-mint bg-brand-mint/10' : 'border-stone-100 bg-white'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <h3 className="font-bold text-stone-800">{goal.label}</h3>
                                        <span className={`text-xs font-bold rounded-full px-3 py-1 ${isMet ? 'bg-brand-mint text-white' : target > 0 ? 'bg-stone-100 text-stone-500' : 'bg-stone-50 text-stone-400'}`}>
                                            {target > 0 ? `${goal.actual}/${target}` : `${goal.actual}/0`}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden shadow-inner">
                                        <div className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-2">
                                        {target > 0 ? (isMet ? 'Goal met' : `${Math.max(target - goal.actual, 0)} more to go`) : 'No goal set'}
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                                    <span className="text-xs font-bold text-stone-400 uppercase">Goal</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="7"
                                        value={target}
                                        onChange={(e) => updateGoal(goal.key, e.target.value)}
                                        className="w-14 bg-transparent text-center font-extrabold text-stone-800 outline-none"
                                    />
                                </label>
                            </div>
                        </div>
                    );
                };

                return (
                    <div ref={goalsScrollRef} className="fixed inset-0 bg-stone-50 z-50 overflow-y-auto animate-fade-in">
                        <div className="max-w-5xl mx-auto px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-36">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-3xl shadow-sm border border-stone-200">
                                <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                                    <span className="bg-brand-yellow/20 text-brand-orange p-2 rounded-xl"><Icons.Target /></span>
                                    Weekly Goals
                                </h2>

                                <div className="flex items-center gap-4 bg-stone-100 p-1 rounded-xl">
                                    <button onClick={() => shiftWeek(-1)} className="p-2 hover:bg-white rounded-lg transition-all"><Icons.ChevronLeft /></button>
                                    <span className="font-bold text-stone-600 min-w-[140px] text-center">{weekLabel}</span>
                                    <button onClick={() => shiftWeek(1)} className="p-2 hover:bg-white rounded-lg transition-all"><Icons.ChevronRight /></button>
                                </div>

                                <button onClick={() => setShowGoals(false)} className="bg-stone-200 hover:bg-stone-300 p-2 rounded-full transition-colors text-stone-500 absolute top-4 right-4 md:static"><Icons.X /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
                                    <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Goals Set</div>
                                    <div className="text-3xl font-extrabold text-stone-800 mt-2">{goalsSet}</div>
                                </div>
                                <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
                                    <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Goals Met</div>
                                    <div className="text-3xl font-extrabold text-brand-mint mt-2">{goalsMet}</div>
                                </div>
                                <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
                                    <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Total Progress</div>
                                    <div className="text-3xl font-extrabold text-stone-800 mt-2">{totalProgressPct}%</div>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setGoalsTab('morning')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${goalsTab === 'morning' ? 'bg-brand-orange text-white shadow-md' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
                                >
                                    Morning
                                </button>
                                <button
                                    onClick={() => setGoalsTab('night')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${goalsTab === 'night' ? 'bg-brand-purple text-white shadow-md' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
                                >
                                    Night
                                </button>
                                <button
                                    onClick={() => setGoalsTab('sadhanas')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${goalsTab === 'sadhanas' ? 'bg-brand-periwinkle text-white shadow-md' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
                                >
                                    Sadhanas
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 space-y-4">
                                {activeGoals.map(goal => <GoalRow key={goal.key} goal={goal} />)}
                            </div>
                        </div>
                    </div>
                );
            };
            // --- COMPARISON SCREEN ---
            const ComparisonScreen = () => (
                <div className="fixed inset-0 bg-stone-50 z-50 overflow-y-auto animate-fade-in">
                    <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-36">
                        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-3xl shadow-sm border border-stone-200">
                            <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                                <span className="bg-brand-mint/20 text-brand-mint p-2 rounded-xl"><Icons.Trends /></span>
                                Monthly Trends
                            </h2>
                            <button onClick={() => setShowComparison(false)} className="bg-stone-200 hover:bg-stone-300 p-2 rounded-full transition-colors text-stone-500"><Icons.X /></button>
                        </div>

                        <div className="flex gap-4 mb-10">
                            <button
                                onClick={() => setTrendsTab('morning')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${trendsTab === 'morning' ? 'bg-gradient-to-r from-brand-orange to-brand-salmon text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Morning
                            </button>
                            <button
                                onClick={() => setTrendsTab('night')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${trendsTab === 'night' ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Night
                            </button>
                            <button
                                onClick={() => setTrendsTab('sadhanas')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${trendsTab === 'sadhanas' ? 'bg-gradient-to-r from-brand-periwinkle to-brand-purple text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Sadhanas
                            </button>
                        </div>

                        {trendsTab === 'morning' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-extrabold text-stone-400 uppercase tracking-[0.22em] mb-5 border-b border-stone-200 pb-2">Morning Routine</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SimpleBarChart title="Morning Ritual Completion" data={trends.map(t => ({ label: t.label, value: t.mr }))} color="bg-gradient-to-r from-brand-orange to-brand-salmon" chartMax={100} />
                                        <SimpleBarChart title="Morning Ritual (Early)" data={trends.map(t => ({ label: t.label, value: t.mrEarly }))} color="bg-brand-yellow" chartMax={100} />
                                        <SimpleBarChart title="Avg MR Completed" data={trends.map(t => ({ label: t.label, value: t.mrCompletionAvgMin }))} color="bg-gradient-to-r from-brand-orange to-brand-salmon" chartMax={24 * 60} valueSuffix="" valueFormatter={(v) => minutesToTimeStr(v)} />
                                        <SimpleBarChart title="Workday Start (Early)" data={trends.map(t => ({ label: t.label, value: t.workdayEarly }))} color="bg-gradient-to-r from-brand-mint to-brand-teal" chartMax={100} />
                                        <SimpleBarChart title="Avg MR Activities" data={trends.map(t => ({ label: t.label, value: t.mrAvg }))} color="bg-brand-orange" valueSuffix="" chartMax={14} />
                                        <SimpleBarChart title="Avg Workday Start" data={trends.map(t => ({ label: t.label, value: t.workdayAvgMin }))} color="bg-gradient-to-r from-brand-mint to-brand-teal" chartMax={24 * 60} valueSuffix="" valueFormatter={(v) => minutesToTimeStr(v)} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-extrabold text-stone-400 uppercase tracking-[0.22em] mb-5 border-b border-stone-200 pb-2">Habits</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SimpleBarChart title="Brush teeth" data={trends.map(t => ({ label: t.label, value: t.brushTeeth }))} color="bg-gradient-to-r from-brand-orange to-brand-salmon" chartMax={100} />
                                        <SimpleBarChart title="Face-care routine" data={trends.map(t => ({ label: t.label, value: t.faceCare }))} color="bg-brand-yellow" chartMax={100} />
                                        <SimpleBarChart title="Pregabalin & vitamins" data={trends.map(t => ({ label: t.label, value: t.pregabalinVitamins }))} color="bg-gradient-to-r from-brand-salmon to-brand-pink" chartMax={100} />
                                        <SimpleBarChart title="Make bed & clean room" data={trends.map(t => ({ label: t.label, value: t.makeBedCleanRoom }))} color="bg-gradient-to-r from-brand-mint to-brand-teal" chartMax={100} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {trendsTab === 'night' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-extrabold text-stone-400 uppercase tracking-[0.22em] mb-5 border-b border-stone-200 pb-2">Shutdown Routine</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SimpleBarChart title="Shutdown Ritual Completion" data={trends.map(t => ({ label: t.label, value: t.sdr }))} color="bg-gradient-to-r from-brand-periwinkle to-brand-purple" chartMax={100} />
                                        <SimpleBarChart title="Shutdown Ritual (Early)" data={trends.map(t => ({ label: t.label, value: t.sdrEarly }))} color="bg-brand-periwinkle" chartMax={100} />
                                        <SimpleBarChart title="Avg SDR Completed" data={trends.map(t => ({ label: t.label, value: t.sdrCompletionAvgMin }))} color="bg-gradient-to-r from-brand-periwinkle to-brand-purple" chartMax={24 * 60} valueSuffix="" valueFormatter={(v) => minutesToTimeStr(v)} />
                                        <SimpleBarChart title="Workday End (Early)" data={trends.map(t => ({ label: t.label, value: t.workdayEndEarly }))} color="bg-gradient-to-r from-brand-blue to-brand-periwinkle" chartMax={100} />
                                        <SimpleBarChart title="Avg SDR Activities" data={trends.map(t => ({ label: t.label, value: t.sdrAvg }))} color="bg-brand-purple" valueSuffix="" chartMax={9} />
                                        <SimpleBarChart title="Avg Workday End" data={trends.map(t => ({ label: t.label, value: t.workdayEndAvgMin }))} color="bg-gradient-to-r from-brand-blue to-brand-periwinkle" chartMax={24 * 60} valueSuffix="" valueFormatter={(v) => minutesToTimeStr(v)} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-extrabold text-stone-400 uppercase tracking-[0.22em] mb-5 border-b border-stone-200 pb-2">Habits</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SimpleBarChart title="Sleep Lights Off" data={trends.map(t => ({ label: t.label, value: t.lights }))} color="bg-brand-yellow" chartMax={100} />
                                        <SimpleBarChart title="No TV / Soundscapes" data={trends.map(t => ({ label: t.label, value: t.tv }))} color="bg-brand-blue" chartMax={100} />
                                        <SimpleBarChart title="No Late Snacks" data={trends.map(t => ({ label: t.label, value: t.lsib }))} color="bg-gradient-to-r from-brand-mint to-brand-teal" chartMax={100} />
                                        <SimpleBarChart title="Bedtime < Midnight" data={trends.map(t => ({ label: t.label, value: t.bedtime }))} color="bg-brand-purple" chartMax={100} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {trendsTab === 'sadhanas' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SimpleBarChart
                                    title="Morning Moment"
                                    data={trends.map(t => ({ label: t.label, value: t.moment }))}
                                    color="bg-gradient-to-r from-brand-yellow to-brand-orange"
                                    chartMax={100}
                                />
                                <SimpleBarChart
                                    title="Meditation"
                                    data={trends.map(t => ({ label: t.label, value: t.meditation }))}
                                    color="bg-gradient-to-r from-brand-salmon to-brand-pink"
                                    chartMax={100}
                                />
                                <SimpleBarChart
                                    title="Stretch / Walk"
                                    data={trends.map(t => ({ label: t.label, value: t.stretch }))}
                                    color="bg-gradient-to-r from-brand-mint to-brand-teal"
                                    chartMax={100}
                                />
                                <SimpleBarChart
                                    title="Rooting"
                                    data={trends.map(t => ({ label: t.label, value: t.rooting }))}
                                    color="bg-gradient-to-r from-brand-purple to-brand-periwinkle"
                                    chartMax={100}
                                />
                            </div>
                        )}
                    </div>
                </div>
            );

            // --- DASHBOARD SCREEN ---
            const ReviewScreen = () => (
                <div className="fixed inset-0 bg-stone-50 z-50 overflow-y-auto animate-fade-in">
                    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-36">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-3xl shadow-sm border border-stone-200">
                            <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                                <span className="bg-brand-periwinkle/20 text-brand-periwinkle p-2 rounded-xl"><Icons.Chart /></span>
                                Monthly Dashboard
                            </h2>
                            <div className="flex items-center gap-4">
                                <input
                                    type="month"
                                    value={reviewMonth}
                                    onChange={(e) => setReviewMonth(e.target.value)}
                                    className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 font-bold text-stone-600 outline-none"
                                />
                                <button onClick={() => setShowReview(false)} className="bg-stone-200 hover:bg-stone-300 p-2 rounded-full transition-colors text-stone-500"><Icons.X /></button>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setReviewTab('morning')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${reviewTab === 'morning' ? 'bg-gradient-to-r from-brand-orange to-brand-salmon text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Morning
                            </button>
                            <button
                                onClick={() => setReviewTab('night')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${reviewTab === 'night' ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Night
                            </button>
                            <button
                                onClick={() => setReviewTab('sadhanas')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${reviewTab === 'sadhanas' ? 'bg-gradient-to-r from-brand-periwinkle to-brand-purple text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Sadhanas
                            </button>
                        </div>

                        {reviewTab === 'morning' && (
                            <div className="space-y-8">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                                    <h3 className="text-lg font-bold text-stone-800 mb-6 uppercase tracking-wider text-sm">Morning Routine</h3>
                                    <StackedBar
                                        label="MR Completed"
                                        early={reviewStats.mr.early}
                                        late={reviewStats.mr.late}
                                        totalDays={reviewStats.totalDays}
                                        gradientEarly="bg-gradient-to-r from-brand-yellow to-brand-orange"
                                        gradientLate="bg-gradient-to-r from-brand-yellow/40 to-brand-orange/40"
                                    />
                                    <StackedBar
                                        label="Workday Start"
                                        early={reviewStats.workdayStart.early}
                                        late={reviewStats.workdayStart.late}
                                        totalDays={reviewStats.totalDays}
                                        gradientEarly="bg-gradient-to-r from-brand-mint to-brand-teal"
                                        gradientLate="bg-gradient-to-r from-brand-mint/40 to-brand-teal/40"
                                    />
                                    <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-bold text-stone-400 uppercase mb-1">Avg MR Completed</div>
                                            <div className="text-3xl font-extrabold text-stone-800">{reviewStats.avgMrCompletionStr}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-stone-400 uppercase mb-1">Avg Workday Start</div>
                                            <div className="text-3xl font-extrabold text-stone-800">{reviewStats.avgWorkdayStr}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                                    <h3 className="text-lg font-bold text-stone-800 mb-6 uppercase tracking-wider text-sm">Habits</h3>
                                    <div className="space-y-4">
                                        <ProgressBar label="Brush teeth" value={reviewStats.morningHabits.brushTeeth} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-orange to-brand-salmon" subLabel={`${reviewStats.morningHabits.brushTeeth}/${reviewStats.totalDays}`} />
                                        <ProgressBar label="Face-care routine" value={reviewStats.morningHabits.faceCare} max={reviewStats.totalDays} gradient="bg-brand-yellow" subLabel={`${reviewStats.morningHabits.faceCare}/${reviewStats.totalDays}`} />
                                        <ProgressBar label="Pregabalin & vitamins" value={reviewStats.morningHabits.pregabalinVitamins} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-salmon to-brand-pink" subLabel={`${reviewStats.morningHabits.pregabalinVitamins}/${reviewStats.totalDays}`} />
                                        <ProgressBar label="Make bed & clean room" value={reviewStats.morningHabits.makeBedCleanRoom} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-mint to-brand-teal" subLabel={`${reviewStats.morningHabits.makeBedCleanRoom}/${reviewStats.totalDays}`} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {reviewTab === 'night' && (
                            <div className="space-y-8">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                                    <h3 className="text-lg font-bold text-stone-800 mb-6 uppercase tracking-wider text-sm">Shutdown Routine</h3>
                                    <StackedBar
                                        label="SDR Completed"
                                        early={reviewStats.sdr.early}
                                        late={reviewStats.sdr.late}
                                        totalDays={reviewStats.totalDays}
                                        gradientEarly="bg-gradient-to-r from-brand-purple to-brand-teal"
                                        gradientLate="bg-gradient-to-r from-brand-purple/40 to-brand-teal/40"
                                    />
                                    <StackedBar
                                        label="Workday End"
                                        early={reviewStats.workdayEnd.early}
                                        late={reviewStats.workdayEnd.late}
                                        totalDays={reviewStats.totalDays}
                                        gradientEarly="bg-gradient-to-r from-brand-blue to-brand-periwinkle"
                                        gradientLate="bg-gradient-to-r from-brand-blue/40 to-brand-periwinkle/40"
                                    />
                                    <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-bold text-stone-400 uppercase mb-1">Avg SDR Completed</div>
                                            <div className="text-3xl font-extrabold text-stone-800">{reviewStats.avgSdrCompletionStr}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-stone-400 uppercase mb-1">Avg Workday End</div>
                                            <div className="text-3xl font-extrabold text-stone-800">{reviewStats.avgWorkdayEndStr}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                                    <h3 className="text-lg font-bold text-stone-800 mb-6 uppercase tracking-wider text-sm">Habits</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                        <ProgressBar label="Lights Off" value={reviewStats.sleep.lights} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-yellow to-brand-orange" subLabel={`${reviewStats.sleep.lights}/${reviewStats.totalDays}`} />
                                        <ProgressBar label="No TV / Soundscapes" value={reviewStats.sleep.tv} max={reviewStats.totalDays} gradient="bg-brand-blue" subLabel={`${reviewStats.sleep.tv}/${reviewStats.totalDays}`} />
                                        <ProgressBar label="No Late Snacks" value={reviewStats.sleep.lsib} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-mint to-brand-teal" subLabel={`${reviewStats.sleep.lsib}/${reviewStats.totalDays}`} />
                                        <ProgressBar label="Bedtime < Midnight" value={reviewStats.sleep.bed} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-periwinkle to-brand-purple" subLabel={`${reviewStats.sleep.bed}/${reviewStats.totalDays}`} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {reviewTab === 'sadhanas' && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                                <h3 className="text-lg font-bold text-stone-800 mb-6 uppercase tracking-wider text-sm">Sadhanas</h3>
                                <div className="space-y-4">
                                    <ProgressBar label="Morning Moment" value={reviewStats.pb.moment} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-yellow to-brand-orange" subLabel={`${reviewStats.pb.moment}/${reviewStats.totalDays}`} />
                                    <ProgressBar label="Meditation" value={reviewStats.pb.meditation} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-salmon to-brand-pink" subLabel={`${reviewStats.pb.meditation}/${reviewStats.totalDays}`} />
                                    <ProgressBar label="Stretch / Walk" value={reviewStats.pb.stretch} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-mint to-brand-teal" subLabel={`${reviewStats.pb.stretch}/${reviewStats.totalDays}`} />
                                    <ProgressBar label="Rooting" value={reviewStats.pb.rooting} max={reviewStats.totalDays} gradient="bg-gradient-to-r from-brand-purple to-brand-periwinkle" subLabel={`${reviewStats.pb.rooting}/${reviewStats.totalDays}`} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );

            if (showComparison) return <ComparisonScreen />;
            if (showReview) return <ReviewScreen />;
            if (showWeekly) return <WeeklyScreen />;
            if (showGoals) return WeeklyGoalsScreen();

            // --- MAIN APP SCREEN ---
            return (
                <div className={`min-h-screen ${theme.bg} px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-36 transition-colors duration-500`}>
                    <div className="max-w-4xl mx-auto">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <h1 className="text-3xl font-semibold text-stone-800 flex items-center gap-3">
                                <span className={`bg-gradient-to-r ${theme.accent} text-white p-2 rounded-lg shadow-md`}>
                                    <Icons.Activity />
                                </span>
                                Habits & Sadhanas
                            </h1>
                            <div className="flex gap-3">
                                <button onClick={() => setShowGoals(true)} className={squareIconButtonClass} aria-label="Weekly Goals" title="Weekly Goals">
                                    <Icons.Target />
                                </button>
                                <button onClick={() => setShowWeekly(true)} className={squareIconButtonClass} aria-label="Weekly Dashboard" title="Weekly Dashboard">
                                    <Icons.Calendar />
                                </button>
                                <button onClick={() => setShowReview(true)} className={squareIconButtonClass} aria-label="Monthly Dashboard" title="Monthly Dashboard">
                                    <Icons.Chart />
                                </button>
                                <button onClick={() => setShowComparison(true)} className={squareIconButtonClass} aria-label="Monthly Trends" title="Monthly Trends">
                                    <Icons.Trends />
                                </button>
                                <button onClick={() => setShowRulesModal(true)} className={squareIconButtonClass} aria-label="Rules" title="Rules">
                                    <Icons.Info />
                                </button>
                                <button onClick={() => setShowExportModal(true)} className={squareIconButtonClass} aria-label="Export and Backup" title="Export and Backup">
                                    <Icons.Download />
                                </button>
                            </div>
                        </div>

                        {/* Date Navigation */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-white/50 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 glass">
                            <div className="flex items-center gap-2">
                                <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-stone-100 rounded-lg"><Icons.ChevronLeft /></button>
                                <div className="flex flex-col items-center mx-4">
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Selected Date</span>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="text-lg font-bold text-stone-800 bg-transparent outline-none cursor-pointer text-center"
                                    />
                                    <span className="text-sm font-medium text-stone-500">{displayDate}</span>
                                </div>
                                <button onClick={() => shiftDate(1)} className="p-2 hover:bg-stone-100 rounded-lg"><Icons.ChevronRight /></button>
                            </div>

                            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setSelectedDate(todayStr)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedDate === todayStr ? 'bg-white shadow-sm text-brand-orange' : 'text-stone-600 hover:bg-white/50'}`}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setSelectedDate(yesterdayStr)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedDate === yesterdayStr ? 'bg-white shadow-sm text-brand-orange' : 'text-stone-600 hover:bg-white/50'}`}
                                >
                                    Yesterday
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setActiveTab('morning')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'morning' ? 'bg-gradient-to-r from-brand-orange to-brand-salmon text-white shadow-lg shadow-brand-orange/20 transform scale-[1.02]' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Morning
                            </button>
                            <button
                                onClick={() => setActiveTab('night')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'night' ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg shadow-brand-purple/20 transform scale-[1.02]' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Night
                            </button>
                            <button
                                onClick={() => setActiveTab('sadhanas')}
                                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'sadhanas' ? 'bg-gradient-to-r from-brand-periwinkle to-brand-purple text-white shadow-lg shadow-brand-periwinkle/20 transform scale-[1.02]' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                            >
                                Sadhanas
                            </button>
                        </div>

                        {activeTab === 'morning' && (
                            <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                                <div className={sectionCardClass}>
                                    <h3 className="text-xl font-bold text-brand-orange mb-6 flex items-center gap-2">
                                        <Icons.Sun /> Morning Routine
                                    </h3>

                                    <div className="mb-6">
                                        <NumberInput
                                            label="Activities Count"
                                            value={currentDaily.mr.count}
                                            max={14}
                                            onChange={(val) => updateDaily({ mr: { ...currentDaily.mr, count: val } })}
                                        />
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold text-stone-500 uppercase">MR Completed</label>
                                            {statusBadge(getMorningRoutineStatus(currentDaily), { lateClass: 'bg-brand-orange/30 text-orange-800' })}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="time"
                                                value={currentDaily.mr.time}
                                                disabled={currentDaily.mr.na}
                                                onChange={(e) => updateDaily({ mr: { ...currentDaily.mr, na: false, time: e.target.value } })}
                                                className={`flex-1 p-3 rounded-xl border-2 font-bold text-lg outline-none focus:border-brand-orange ${currentDaily.mr.na ? 'bg-stone-100 text-stone-400' : 'bg-white text-stone-800'}`}
                                            />
                                            <button
                                                onClick={() => updateDaily({ mr: { ...currentDaily.mr, na: !currentDaily.mr.na, time: '' } })}
                                                className={`px-4 rounded-xl font-bold border-2 transition-colors ${currentDaily.mr.na ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-400 border-stone-200'}`}
                                            >
                                                N/A
                                            </button>
                                        </div>
                                    </div>


                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold text-stone-500 uppercase">Workday Start</label>
                                            {statusBadge(getWorkdayStartStatus(currentDaily), { earlyClass: 'bg-brand-yellow/30 text-stone-700', lateClass: 'bg-brand-orange/30 text-orange-800' })}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="time"
                                                value={currentDaily.workday}
                                                disabled={currentDaily.workdayStartNA}
                                                onChange={(e) => updateDaily({ workdayStartNA: false, workday: e.target.value })}
                                                className={`flex-1 p-3 rounded-xl border-2 font-bold text-lg outline-none focus:border-brand-orange ${currentDaily.workdayStartNA ? 'bg-stone-100 text-stone-400' : 'bg-white text-stone-800'}`}
                                            />
                                            <button
                                                onClick={() => updateDaily({ workdayStartNA: !currentDaily.workdayStartNA, workday: '' })}
                                                className={`px-4 rounded-xl font-bold border-2 transition-colors ${currentDaily.workdayStartNA ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-400 border-stone-200'}`}
                                            >
                                                N/A
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={sectionCardClass}>
                                    <h3 className="text-xl font-bold text-brand-salmon mb-6 flex items-center gap-2">
                                        <Icons.Activity /> Habits
                                    </h3>
                                    <div className="space-y-3">
                                        <Toggle
                                            label="Brush teeth"
                                            checked={currentDaily.morningHabits.brushTeeth}
                                            onChange={(val) => updateDaily({ morningHabits: { ...currentDaily.morningHabits, brushTeeth: val } })}
                                            activeClass="border-brand-orange"
                                        />
                                        <Toggle
                                            label="Face-care routine"
                                            checked={currentDaily.morningHabits.faceCare}
                                            onChange={(val) => updateDaily({ morningHabits: { ...currentDaily.morningHabits, faceCare: val } })}
                                            activeClass="border-brand-yellow"
                                        />
                                        <Toggle
                                            label="Pregabalin & vitamins"
                                            checked={currentDaily.morningHabits.pregabalinVitamins}
                                            onChange={(val) => updateDaily({ morningHabits: { ...currentDaily.morningHabits, pregabalinVitamins: val } })}
                                            activeClass="border-brand-pink"
                                        />
                                        <Toggle
                                            label="Make bed & clean room"
                                            checked={currentDaily.morningHabits.makeBedCleanRoom}
                                            onChange={(val) => updateDaily({ morningHabits: { ...currentDaily.morningHabits, makeBedCleanRoom: val } })}
                                            activeClass="border-brand-teal"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'night' && (
                            <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                                <div className={sectionCardClass}>
                                    <h3 className="text-xl font-bold text-brand-purple mb-6 flex items-center gap-2">
                                        <Icons.Moon /> Shutdown Routine
                                    </h3>

                                    <div className="mb-6">
                                        <NumberInput
                                            label="Activities Count"
                                            value={currentDaily.sdr.count}
                                            max={9}
                                            onChange={(val) => updateDaily({ sdr: { ...currentDaily.sdr, count: val } })}
                                        />
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold text-stone-500 uppercase">SDR Completed</label>
                                            {statusBadge(getShutdownRoutineStatus(currentDaily), { earlyLabel: '\u{1F989} Good Owl', earlyClass: 'bg-brand-periwinkle/30 text-stone-700', lateClass: 'bg-brand-blue/30 text-blue-800' })}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="time"
                                                value={currentDaily.sdr.time}
                                                disabled={currentDaily.sdr.na}
                                                onChange={(e) => updateDaily({ sdr: { ...currentDaily.sdr, na: false, time: e.target.value } })}
                                                className={`flex-1 p-3 rounded-xl border-2 font-bold text-lg outline-none focus:border-brand-purple ${currentDaily.sdr.na ? 'bg-stone-100 text-stone-400' : 'bg-white text-stone-800'}`}
                                            />
                                            <button
                                                onClick={() => updateDaily({ sdr: { ...currentDaily.sdr, na: !currentDaily.sdr.na, time: '' } })}
                                                className={`px-4 rounded-xl font-bold border-2 transition-colors ${currentDaily.sdr.na ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-400 border-stone-200'}`}
                                            >
                                                N/A
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold text-stone-500 uppercase">Workday End</label>
                                            {statusBadge(getWorkdayEndStatus(currentDaily), { earlyLabel: '\u{1F989} Good Owl', earlyClass: 'bg-brand-periwinkle/30 text-stone-700', lateClass: 'bg-brand-blue/30 text-blue-800' })}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="time"
                                                value={currentDaily.workdayEnd || ''}
                                                disabled={currentDaily.workdayEndNA}
                                                onChange={(e) => updateDaily({ workdayEndNA: false, workdayEnd: e.target.value })}
                                                className={`flex-1 p-3 rounded-xl border-2 font-bold text-lg outline-none focus:border-brand-purple ${currentDaily.workdayEndNA ? 'bg-stone-100 text-stone-400' : 'bg-white text-stone-800'}`}
                                            />
                                            <button
                                                onClick={() => updateDaily({ workdayEndNA: !currentDaily.workdayEndNA, workdayEnd: '' })}
                                                className={`px-4 rounded-xl font-bold border-2 transition-colors ${currentDaily.workdayEndNA ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-400 border-stone-200'}`}
                                            >
                                                N/A
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={sectionCardClass}>
                                    <h3 className="text-xl font-bold text-brand-blue mb-6 flex items-center gap-2">
                                        <Icons.Activity /> Habits
                                    </h3>
                                    <div className="space-y-3">
                                        <Toggle
                                            label="Sleep Lights Off"
                                            checked={currentDaily.sleep.lights}
                                            onChange={(val) => updateDaily({ sleep: { ...currentDaily.sleep, lights: val } })}
                                            activeClass="border-brand-yellow"
                                        />
                                        <Toggle
                                            label="No TV / Soundscapes"
                                            checked={currentDaily.sleep.tv}
                                            onChange={(val) => updateDaily({ sleep: { ...currentDaily.sleep, tv: val } })}
                                            activeClass="border-brand-blue"
                                        />
                                        <Toggle
                                            label="No Late Snacks"
                                            checked={currentDaily.sleep.noLSIB}
                                            onChange={(val) => updateDaily({ sleep: { ...currentDaily.sleep, noLSIB: val } })}
                                            activeClass="border-brand-mint"
                                        />
                                        <Toggle
                                            label="Bedtime < Midnight"
                                            checked={currentDaily.sleep.bedtime}
                                            onChange={(val) => updateDaily({ sleep: { ...currentDaily.sleep, bedtime: val } })}
                                            activeClass="border-brand-purple"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sadhanas' && (
                            <div className={`${sectionCardClass} animate-fade-in max-w-2xl mx-auto`}>
                                <h3 className="text-xl font-bold text-brand-periwinkle mb-6 flex items-center gap-2">
                                    <Icons.Sparkles /> Sadhanas
                                </h3>
                                <div className="space-y-4">
                                    <Toggle
                                        label="Morning Moment"
                                        checked={currentPB.moment}
                                        onChange={(val) => updatePB({ moment: val })}
                                        activeClass="border-brand-yellow"
                                    />
                                    <Toggle
                                        label="Meditation"
                                        checked={currentPB.meditation}
                                        onChange={(val) => updatePB({ meditation: val })}
                                        activeClass="border-brand-pink"
                                    />
                                    <Toggle
                                        label="Stretch / Walk"
                                        checked={currentPB.stretch}
                                        onChange={(val) => updatePB({ stretch: val })}
                                        activeClass="border-brand-teal"
                                    />
                                    <Toggle
                                        label="Rooting"
                                        checked={currentPB.rooting}
                                        onChange={(val) => updatePB({ rooting: val })}
                                        activeClass="border-brand-purple"
                                    />
                                </div>
                            </div>
                        )}

                        {/* RULES MODAL */}
                        <Modal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} title="Early / Late Rules">
                            <div className="space-y-5 text-stone-700">
                                <p className="text-sm text-stone-500 font-semibold leading-relaxed">
                                    A time counts as early only when it is logged before its cutoff. If no time is logged, it does not count as early or late.
                                </p>

                                <div className="space-y-3">
                                    <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-4">
                                        <div className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-1">Morning Routine</div>
                                        <div className="font-bold text-stone-800">MR Completed</div>
                                        <div className="text-sm text-stone-500">Early before 9:50 AM. Late at 9:50 AM or later.</div>
                                    </div>

                                    <div className="bg-brand-mint/10 border border-brand-mint/20 rounded-2xl p-4">
                                        <div className="text-xs font-bold uppercase tracking-widest text-brand-mint mb-1">Morning Routine</div>
                                        <div className="font-bold text-stone-800">Workday Start</div>
                                        <div className="text-sm text-stone-500">Early before 10:10 AM. Late at 10:10 AM or later.</div>
                                    </div>

                                    <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-2xl p-4">
                                        <div className="text-xs font-bold uppercase tracking-widest text-brand-purple mb-1">Shutdown Routine</div>
                                        <div className="font-bold text-stone-800">SDR Completed</div>
                                        <div className="text-sm text-stone-500">Early before 10:45 PM. Late at 10:45 PM or later.</div>
                                    </div>

                                    <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-2xl p-4">
                                        <div className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-1">Shutdown Routine</div>
                                        <div className="font-bold text-stone-800">Workday End</div>
                                        <div className="text-sm text-stone-500">Early before 10:00 PM. Late at 10:00 PM or later.</div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        {/* EXPORT MODAL */}
                        <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export & Backup" maxWidth="max-w-3xl">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Icons.Download /> Download Markdown Table</h4>
                                    <div className="bg-gray-50 p-3 rounded-xl space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-500">For Month:</span>
                                            <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className="bg-white border rounded-lg px-3 py-1 font-medium" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => downloadFile(generateMarkdown('daily'), `daily_habits_${exportMonth}.md`)} className="bg-brand-orange text-white py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">Daily Habits</button>
                                            <button onClick={() => downloadFile(generateMarkdown('pb'), `sadhanas_${exportMonth}.md`)} className="bg-brand-purple text-white py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors">Sadhanas</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Icons.Target /> Cloudflare Sync</h4>
                                    <div className="bg-gray-50 p-3 rounded-xl space-y-2">
                                        <div className="text-xs font-bold text-stone-500 bg-white border border-stone-100 rounded-lg p-2">
                                            {syncStatus}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button disabled={isSyncing} onClick={() => loadFromCloud({ manual: true })} className="border-2 border-stone-200 text-stone-600 py-2 rounded-xl text-sm font-bold hover:bg-stone-50 disabled:opacity-40">Load Cloud</button>
                                            <button disabled={isSyncing} onClick={() => saveToCloud(getCloudPayload(), { manual: true })} className="bg-brand-mint text-white py-2 rounded-xl text-sm font-bold hover:bg-teal-500 disabled:opacity-40">Save Cloud</button>
                                        </div>
                                        <p className="text-xs text-stone-400 leading-relaxed">
                                            Syncs with sadhanas-api using the cloud key <span className="font-mono">habits</span>. Local browser backup stays on.
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Icons.Upload /> Full Data Backup</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={handleBackup} className="border-2 border-stone-200 text-stone-600 py-2 rounded-xl text-sm font-bold hover:bg-stone-50">Download Backup (.json)</button>
                                        <label className="border-2 border-stone-200 text-stone-600 py-2 rounded-xl text-sm font-bold hover:bg-stone-50 cursor-pointer text-center">
                                            Restore Backup
                                            <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Modal>

                    </div>
                </div>
            );
        }

export default App;



































































































