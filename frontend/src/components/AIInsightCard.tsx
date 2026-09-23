import React from 'react';
import { Zap, HelpCircle, Bot, ArrowRight } from 'lucide-react';

interface AIInsightCardProps {
  title?: string;
  what: string;
  why?: string;
  action?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AIInsightCard({ 
  title = "AI INSIGHT", 
  what, 
  why, 
  action,
  className = "",
  size = "md"
}: AIInsightCardProps) {
  
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-indigo-500/30 rounded-xl overflow-hidden shadow-sm shadow-indigo-100/50 dark:shadow-indigo-500/10 transition-colors ${className}`}>
      <div className={`bg-indigo-100/50 dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-500/20 flex items-center ${isSm ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
        <Bot className={`${isSm ? 'w-3 h-3 mr-1.5' : 'w-4 h-4 mr-2'} text-indigo-600 dark:text-indigo-400`} />
        <span className={`font-bold tracking-wider text-indigo-800 dark:text-indigo-300 uppercase ${isSm ? 'text-[10px]' : 'text-xs'}`}>
          {title}
        </span>
      </div>
      
      <div className={`${isSm ? 'p-3' : isLg ? 'p-6' : 'p-4'}`}>
        <div className="mb-3">
          {why && <p className={`font-bold text-indigo-900 dark:text-indigo-300 mb-1 ${isSm ? 'text-xs' : 'text-sm'}`}>What happened?</p>}
          <p className={`text-slate-800 dark:text-slate-200 leading-relaxed ${isLg ? 'text-lg font-medium' : isSm ? 'text-xs' : 'text-sm'}`}>
            {what}
          </p>
        </div>

        {why && (
          <div className="mb-3 pl-3 border-l-2 border-indigo-300 dark:border-indigo-500/50">
            <p className={`font-bold text-indigo-900 dark:text-indigo-300 mb-0.5 flex items-center ${isSm ? 'text-[10px]' : 'text-xs'}`}>
              <HelpCircle className="w-3 h-3 mr-1 opacity-70" /> WHY?
            </p>
            <p className={`text-slate-600 dark:text-slate-400 italic ${isSm ? 'text-[10px]' : 'text-sm'}`}>
              "{why}"
            </p>
          </div>
        )}

        {action && (
          <div className={`mt-4 pt-3 border-t border-indigo-100/50 dark:border-indigo-500/20 flex items-start`}>
            <Zap className={`text-brand-orange shrink-0 mt-0.5 mr-2 ${isSm ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <div>
              <p className={`font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-0.5 ${isSm ? 'text-[10px]' : 'text-xs'}`}>
                System Action
              </p>
              <p className={`text-slate-700 dark:text-slate-300 font-medium ${isSm ? 'text-[10px]' : 'text-sm'}`}>
                {action}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
