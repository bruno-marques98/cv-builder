import { CoverLetterData } from "../types";

export function CoverLetterTemplate({ letter }: { letter: CoverLetterData }) {
  const paragraphs = letter.body.split("\n\n").map((p) => p.trim()).filter(Boolean);
  return (
    <div className="h-full w-full bg-white text-[#1B2430] p-10 text-[11px] leading-relaxed flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          {letter.senderName}
        </h1>
        <p className="text-[9.5px] opacity-60 mt-0.5">
          {[letter.senderEmail, letter.senderPhone].filter(Boolean).join("  ·  ")}
        </p>
      </div>

      {letter.date && <p className="text-[9.5px] opacity-60 mb-4">{letter.date}</p>}

      <div className="mb-6">
        <p>{letter.recipientName}</p>
        <p>{letter.recipientCompany}</p>
      </div>

      {letter.subject && <p className="font-semibold mb-4">{letter.subject}</p>}

      <div className="flex flex-col gap-3">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <p className="mt-8">{letter.closing}</p>
      <p className="mt-6 font-medium">{letter.senderName}</p>
    </div>
  );
}
