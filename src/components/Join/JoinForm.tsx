"use client";

const codeValidation = (e: React.FormEvent<HTMLInputElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const code = form.value;
  if (code.match(/[^a-z0-9]/gi)) {
    form.value = code.replace(/[^a-z0-9]/gi, "");
  }
  if (code.length > 10) {
    form.value = code.slice(0, 10);
  }
};

const JoinForm = () => {
  return (
    <div className="relative flex h-screen max-w-[400px] flex-col items-center justify-center gap-5">
      <span className="text-[#f0f0f0]">
        <span>enter a room code</span>
        <br></br>
      </span>
      <div className="flex items-center justify-center gap-10 rounded-3xl bg-[#141316] px-6 py-2 pr-2">
        <form
          spellCheck="false"
          className="gap- flex items-center justify-center rounded-3xl bg-[#141316]  py-1 pl-2 pr-2 text-xl font-semibold text-white"
        >
          <span className="text-slate-500">VC-</span>
          <input
            type="text"
            placeholder="Code"
            autoFocus
            maxLength={10}
            className="w-full bg-transparent outline-none"
            style={{
              textTransform: "uppercase",
            }}
            onChange={codeValidation}
          />
          <div className="flex flex-row gap-2">
            <div className="flex items-center justify-center gap-10 rounded-2xl bg-[#ff005a] px-6 py-2">
              <span className="text-white">Join</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinForm;
