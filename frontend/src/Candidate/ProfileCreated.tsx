import React from "react";
import { FiCheckCircle, FiMail, FiUser, FiFileText, FiDatabase, FiCopy, FiClock, FiHeadphones } from "react-icons/fi";

export default function ProfileCreated() {
  return (
    <div className="flex min-h-screen bg-[#f8f9fc] font-sans">
      {/* Sidebar - මුල් රූපයේ පරිදි gradient සහ පෙනුම */}
      <aside className="w-[35%] bg-gradient-to-b from-[#063d68] to-[#39a75f] text-white p-10 flex flex-col justify-between">
        <div className="text-sm font-bold tracking-widest opacity-80">WORKFORCE HIRING SOLUTIONS</div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">You’re Now Part of Our <br /> <span className="text-[#9ce44b]">Global Talent Network!</span></h1>
          <p className="mt-6 text-sm text-white/80 leading-relaxed">We’re excited to have you with us. Your profile helps our hiring partners discover the right talent.</p>
          <div className="mt-10 bg-black/20 p-5 rounded-2xl text-xs backdrop-blur-sm">
            🔒 Your information is safe, secure and will never be shared publicly.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="flex justify-end text-sm text-gray-500 mb-8 gap-2 items-center">
          <FiHeadphones /> Need Help? <span className="font-semibold text-gray-800">support@workforcehs.com</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
          <div className="text-center">
            <FiCheckCircle className="text-green-500 text-6xl mx-auto" />
            <h2 className="text-3xl font-bold mt-6">Welcome to Our <span className="text-green-600">Talent Network!</span></h2>
            <p className="text-gray-500 mt-3">Your profile has been successfully added to our candidate pool.</p>
          </div>

          <div className="mt-8 bg-blue-50 text-blue-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <FiMail /> A confirmation email has been sent to <strong>john.doe@gmail.com</strong>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[ { icon: FiUser, label: "Profile Submitted" }, { icon: FiFileText, label: "CV Uploaded" }, { icon: FiDatabase, label: "Record Created" } ].map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
                <item.icon className="mx-auto text-green-600 text-2xl mb-3" />
                <p className="font-semibold text-sm text-gray-800">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="border border-gray-200 rounded-2xl p-6">
              <p className="text-xs text-gray-500 uppercase">Your Candidate ID</p>
              <div className="flex justify-between items-center font-bold text-lg mt-2 font-mono">WHS-2026-1048 <FiCopy className="cursor-pointer" /></div>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6">
              <p className="text-xs text-gray-500 uppercase">Profile Strength</p>
              <div className="mt-2 text-lg font-bold">85% <span className="text-sm font-normal text-gray-500 ml-2">Great profile strength</span></div>
            </div>
          </div>
        </div>

        {/* Timeline Footer */}
        <div className="mt-8 bg-white p-8 rounded-2xl border border-gray-100 flex justify-between items-center">
          {["Profile Created", "Under Review", "Matching", "Contact"].map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center font-bold text-blue-600">{i + 1}</div>
              <p className="text-xs font-semibold text-gray-600">{t}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}