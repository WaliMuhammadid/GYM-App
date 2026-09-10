'use client';
import React from 'react';

export default function FormattedMessage({ content, isAi = true }) {
  if (!content) return null;

  // Helper to parse inline bold (**text**)
  const formatInlineText = (text) => {
    if (!text) return null;

    // First strip any stray hash symbols that might be inside inline text
    const sanitized = text.replace(/#+/g, '').trim();

    const parts = sanitized.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={i} className={isAi ? 'text-[#D0FF00] font-bold' : 'text-white font-bold'}>
            {inner}
          </strong>
        );
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const renderedElements = [];
  let currentList = null;

  const flushList = () => {
    if (currentList) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="space-y-1.5 my-2">
          {currentList}
        </ul>
      );
      currentList = null;
    }
  };

  lines.forEach((rawLine, index) => {
    let trimmed = rawLine.trim();

    // 1. Strip all leading markdown hashes (#, ##, ###, ####, etc.)
    trimmed = trimmed.replace(/^#+\s*/, '').trim();

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // 2. Horizontal Rule / Divider (--- or ***)
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      renderedElements.push(
        <div
          key={`hr-${index}`}
          className="w-full h-px bg-gradient-to-r from-transparent via-[#27272A] to-transparent my-3.5"
        />
      );
      return;
    }

    // 3. Day / Phase Headers (e.g. "Day 1: Push Day", "Day 2: Pull Day", "Workout Routine")
    const dayMatch = trimmed.match(/^(Day\s+\d+[:\s]+)(.*)/i);
    if (dayMatch) {
      flushList();
      const [, dayTag, dayDetails] = dayMatch;
      renderedElements.push(
        <div
          key={`day-${index}`}
          className="bg-[#18181B] border border-[#27272A] rounded-xl p-2.5 my-2.5 flex items-center gap-2.5 shadow-sm"
        >
          <span className="font-mono text-[10px] font-extrabold bg-[#D0FF00] text-[#050505] px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
            {dayTag.replace(/[:\s]+$/, '')}
          </span>
          <span className="font-montserrat text-xs font-bold text-white uppercase tracking-wide truncate">
            {formatInlineText(dayDetails)}
          </span>
        </div>
      );
      return;
    }

    // 4. Section titles (e.g. "Workout Routine", "Actionable Rules", "4 Pillars")
    if (
      trimmed.match(/^(Workout Routine|Actionable Rules|4 Pillars|Core Pillars|Weekly Schedule)/i) ||
      (trimmed.length < 40 && !trimmed.includes(':') && rawLine.startsWith('#'))
    ) {
      flushList();
      renderedElements.push(
        <div key={`section-${index}`} className="flex items-center gap-2 mt-4 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#D0FF00] shadow-[0_0_8px_#D0FF00]"></span>
          <h3 className="font-montserrat text-sm font-black text-white uppercase tracking-wider">
            {formatInlineText(trimmed)}
          </h3>
        </div>
      );
      return;
    }

    // 5. Next Steps / Call to Action at the end
    if (trimmed.match(/^Next Steps?:/i)) {
      flushList();
      const stepText = trimmed.replace(/^Next Steps?:\s*/i, '');
      renderedElements.push(
        <div
          key={`next-${index}`}
          className="mt-4 bg-[#D0FF00]/10 border border-[#D0FF00]/30 rounded-2xl p-3.5 flex items-start gap-2.5"
        >
          <span className="material-symbols-outlined text-[#D0FF00] text-lg shrink-0 mt-0.5">
            bolt
          </span>
          <div>
            <span className="font-mono text-[10px] font-bold text-[#D0FF00] uppercase tracking-widest block mb-1">
              Coach Next Step
            </span>
            <p className="text-xs text-[#E4E4E7] leading-relaxed">
              {formatInlineText(stepText)}
            </p>
          </div>
        </div>
      );
      return;
    }

    // 6. Exercise Row Format: "Exercise Name: X Sets x Y Reps"
    const exerciseMatch = trimmed.match(/^([^:]+):\s*(\d+\s*Sets\s*[xX•]\s*[^,\n]+)(.*)/i);
    if (exerciseMatch) {
      flushList();
      const [, exerciseName, setsReps, extraInfo] = exerciseMatch;
      renderedElements.push(
        <div
          key={`ex-${index}`}
          className="bg-[#050505] border border-[#27272A] rounded-xl px-3 py-2 my-1.5 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D0FF00] shrink-0"></span>
            <span className="font-inter text-[13px] font-medium text-white truncate">
              {formatInlineText(exerciseName.replace(/^[*•-]\s*/, ''))}
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1">
            <span className="font-mono text-[10px] font-bold bg-[#18181B] text-[#D0FF00] border border-[#27272A] px-2 py-0.5 rounded">
              {setsReps.trim()}
            </span>
            {extraInfo && (
              <span className="font-inter text-[11px] text-[#A1A1AA] hidden sm:inline">
                {formatInlineText(extraInfo)}
              </span>
            )}
          </div>
        </div>
      );
      return;
    }

    // 7. Bullet point item (* or -)
    if (trimmed.match(/^[*•-]\s+/)) {
      const itemText = trimmed.replace(/^[*•-]\s+/, '');
      if (!currentList) currentList = [];
      currentList.push(
        <li key={`li-${index}`} className="flex items-start gap-2 text-[13px] leading-relaxed text-[#E4E4E7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D0FF00] mt-1.5 shrink-0 shadow-[0_0_6px_rgba(208,255,0,0.3)]" />
          <div className="flex-1">{formatInlineText(itemText)}</div>
        </li>
      );
      return;
    }

    // 8. Numbered question/step (1. 2. etc.)
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberMatch) {
      const [, num, itemText] = numberMatch;
      if (!currentList) currentList = [];
      currentList.push(
        <li key={`num-${index}`} className="flex items-start gap-2 text-[13px] leading-relaxed text-[#E4E4E7]">
          <span className="font-mono text-[10px] font-bold bg-[#D0FF00]/15 text-[#D0FF00] border border-[#D0FF00]/30 rounded px-1.5 py-0.5 shrink-0">
            {num}
          </span>
          <div className="flex-1">{formatInlineText(itemText)}</div>
        </li>
      );
      return;
    }

    // 9. Labeled advice item (e.g. "Warm-up: ...", "Progressive Overload: ...")
    const labelMatch = trimmed.match(/^([A-Za-z\s&-]+):\s+(.+)/);
    if (labelMatch && labelMatch[1].length < 25 && !trimmed.toLowerCase().includes('http')) {
      flushList();
      const [, labelTitle, labelBody] = labelMatch;
      renderedElements.push(
        <div key={`rule-${index}`} className="my-1.5 text-[13px] leading-relaxed text-[#E4E4E7]">
          <span className="font-mono text-[11px] font-bold text-[#D0FF00] uppercase tracking-wide mr-1.5">
            {labelTitle}:
          </span>
          <span>{formatInlineText(labelBody)}</span>
        </div>
      );
      return;
    }

    // 10. Default paragraph
    flushList();
    renderedElements.push(
      <p key={`p-${index}`} className="text-[13.5px] leading-relaxed text-[#E4E4E7] my-1">
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{renderedElements}</div>;
}
