/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from "react";

const codeValidation = (e: React.FormEvent<HTMLInputElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const code = form.value;
  if (code.length === 10) {
    console.log("valid");
  } else {
    console.log("invalid");
  }
};

const JoinForm = () => {
  return (
    <div className="relative m-auto flex h-full w-full max-w-[400px] flex-col items-center justify-center gap-5">
      <div className="flex h-[300px] w-[300px] flex-col items-center justify-center gap-16 bg-[#333333] md:hidden">
        <span>Allow camera access\u2028 to scan qr code</span>
        <span>Give Permission</span>
      </div>
      <span className="flex bg-[#333333] md:hidden">
        <span>or type the code</span>
        <br></br>
      </span>
      <span className="text-[#f0f0f0]">
        <span>enter a room code</span>
        <br></br>
      </span>
      <div className="flex items-center justify-center gap-10 rounded-3xl bg-[#141316] px-6 py-2 pr-2">
        <form
          spellCheck="false"
          className="gap- flex items-center justify-center rounded-3xl bg-[#141316] px-4 py-1 pl-2 pr-2 text-xl font-semibold text-white"
        >
          <span className="text-slate-500">VC-</span>
          <input
            type="text"
            placeholder="code"
            autoFocus
            maxLength={10}
            className="bg-transparent outline-none"
            style={{
              textTransform: "uppercase",
            }}
            onChange={codeValidation}
          />
          <div className="flex items-center justify-center gap-10 rounded-2xl bg-[#ff005a] px-6 py-2">
            <span
              style={{
                height: "auto",
                textAlign: "left",
                fontStyle: "normal",
                fontWeight: "500",
                fontFamily: "Inter",
                fontSize: "18px",
                color: "rgb(255, 255, 255)",
              }}
            >
              Join
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinForm;
