const Icons = {
            Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>,
            Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
            Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
            X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
            Chart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
            Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
            ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
            ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
            Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" transform="scale(0.85) translate(2,2)" /></svg>,
            Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
            Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
            Trends: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
            Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
            Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
            Target: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
        };

        

        // --- COMPONENTS ---

        const ProgressBar = ({ label, value, max, gradient, subLabel }) => {
            const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
            return (
                <div className="mb-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-stone-700 text-sm">{label}</span>
                        <div className="text-right">
                            <span className="text-sm font-bold text-stone-800">{percentage}%</span>
                            {subLabel && <span className="text-xs text-stone-400 ml-2">({subLabel})</span>}
                        </div>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full transition-all duration-1000 ${gradient}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            );
        };

        const StackedBar = ({ label, early, late, totalDays, gradientEarly, gradientLate }) => {
            const earlyPct = totalDays > 0 ? (early / totalDays) * 100 : 0;
            const latePct = totalDays > 0 ? (late / totalDays) * 100 : 0;

            return (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-stone-700">{label}</span>
                        <div className="text-xs font-mono text-stone-500">
                            <span className="font-bold text-stone-800">{early + late}</span>/{totalDays} Done
                        </div>
                    </div>
                    <div className="flex w-full h-4 rounded-full overflow-hidden shadow-sm bg-stone-100">
                        {early > 0 && <div className={`h-full ${gradientEarly}`} style={{ width: `${earlyPct}%` }} title={`Early: ${early}`}></div>}
                        {late > 0 && <div className={`h-full ${gradientLate}`} style={{ width: `${latePct}%` }} title={`Late: ${late}`}></div>}
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${gradientEarly}`}></div> Before Time ({early})</div>
                        <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${gradientLate}`}></div> After Time ({late})</div>
                    </div>
                </div>
            );
        };

        const SimpleBarChart = ({
            data,
            color,
            title,
            height = "h-48",
            valueSuffix = "%",
            chartMax = 100,
            valueFormatter = (v) => `${v}${valueSuffix}`,
        }) => {
            const max = chartMax;

            return (
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm mb-6">
                    <h4 className="font-bold text-stone-800 mb-12 text-sm uppercase tracking-wide">{title}</h4>

                    <div className={`flex items-end gap-3 ${height} mb-4`}>
                        {data.map((d, i) => {
                            const safeValue = Number.isFinite(d.value) ? d.value : 0;
                            const pct = max > 0 ? (safeValue / max) * 100 : 0;

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative">
                                    <div className="absolute bottom-full mb-1 text-sm font-bold text-stone-600">
                                        {valueFormatter(safeValue)}
                                    </div>

                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 ${color}`}
                                        style={{ height: `${pct}%` }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        {data.map((d, i) => (
                            <div key={i} className="flex-1 text-center">
                                <div className="text-xs font-bold text-stone-500">{d.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        const Toggle = ({ label, checked, onChange, icon, activeClass }) => (
            <div onClick={() => onChange(!checked)} className={`cursor-pointer select-none p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${checked ? `bg-white ${activeClass} shadow-sm` : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${checked ? activeClass.replace('border-', 'bg-').replace('text-', 'text-white ') : 'bg-gray-200'}`}>
                    </div>
                    <span className={`font-semibold ${checked ? 'text-gray-800' : 'text-gray-500'}`}>{label}</span>
                </div>
                {icon && <div className="text-2xl">{icon}</div>}
            </div>
        );

        const NumberInput = ({ value, max, onChange, label }) => (
            <div className="bg-white p-3 rounded-xl border-2 border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                        className="w-12 text-center text-xl font-bold text-gray-800 bg-gray-50 rounded-lg py-1 outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <span className="text-gray-400 font-medium">/ {max}</span>
                </div>
            </div>
        );

        const Modal = ({ isOpen, onClose, title, children }) => {
            if (!isOpen) return null;
            return (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 px-4 pt-8 pb-16 md:pt-10 md:pb-20">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden slide-up max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><Icons.X /></button>
                        </div>
                        <div className="p-6 pb-10">
                            {children}
                        </div>
                    </div>
                </div>
            );
        };

export { Icons, ProgressBar, StackedBar, SimpleBarChart, Toggle, NumberInput, Modal };





