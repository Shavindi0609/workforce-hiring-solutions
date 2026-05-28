import React from "react";
import { FiCheckCircle, FiMail, FiUser, FiFileText, FiDatabase, FiHeadphones, FiCopy } from "react-icons/fi";

export default function ProfileCreated() {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] font-sans">
      {/* Sidebar - වම් පස කොටස */}
      <aside className="w-[30%] bg-gradient-to-br from-[#0b5d90] to-[#39a75f] text-white p-10 flex flex-col justify-between">
        <div className="font-bold tracking-widest text-sm">WORKFORCE HIRING SOLUTIONS</div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">You’re Now Part of Our <br /> <span className="text-[#9ce44b]">Global Talent Network!</span></h1>
          <p className="mt-4 text-sm text-white/90">We’re excited to have you with us. Your profile helps our hiring partners discover the right talent for future opportunities.</p>
          <div className="mt-8 p-6 bg-white/10 rounded-2xl border border-white/20 text-sm">
            🔒 Your information is safe, secure and will never be shared publicly.
          </div>
        </div>
      </aside>

      {/* Main Content - දකුණු පස කොටස (ඔබ ඉල්ලූ පරිදි) */}
      <main className="w-[70%] p-10 flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-end items-center text-sm text-gray-500 gap-2">
          <FiHeadphones /> Need Help? <span className="font-semibold text-gray-800">support@workforcehs.com</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border p-10 flex flex-col gap-8">
          <div className="text-center">
            <FiCheckCircle className="text-[#39a75f] text-6xl mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Welcome to Our Talent Network!</h2>
            <p className="text-gray-500 mt-2">Your profile has been successfully added to our candidate pool.</p>
          </div>

          <div className="bg-[#f0f7ff] text-[#0b5d90] p-4 rounded-xl flex items-center justify-center gap-2 text-sm border border-blue-100">
            <FiMail /> A confirmation email has been sent to <b>john.doe@gmail.com</b> with your submission details.
          </div>

          {/* Profile Status Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[ 
              { icon: FiUser, label: "Profile Submitted", desc: "Your details have been successfully submitted." }, 
              { icon: FiFileText, label: "CV Uploaded", desc: "Your CV has been uploaded successfully." }, 
              { icon: FiDatabase, label: "Candidate Record Created", desc: "Your profile is now added to our secure database." } 
            ].map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
                <item.icon className="mx-auto text-[#39a75f] mb-3 text-2xl" />
                <p className="font-bold text-sm text-gray-800">{item.label}</p>
                <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* ID and Strength */}
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-2xl p-6">
                <p className="text-xs text-gray-500 mb-1">Your Candidate ID</p>
                <div className="flex justify-between items-center">
                    <b className="text-xl text-[#0b5d90]">WHS-2026-1048</b>
                    <FiCopy className="text-gray-400 cursor-pointer"/>
                </div>
            </div>
            <div className="border border-gray-100 rounded-2xl p-6 flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500">Profile Strength</p>
                    <b className="text-xl text-[#39a75f]">85%</b>
                </div>
                <button className="text-xs font-bold text-[#0b5d90]">Update Profile →</button>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-[#0b5d90] text-white py-4 rounded-xl font-bold">Go to Dashboard</button>
            <button className="flex-1 border py-4 rounded-xl font-bold text-gray-700">Edit Profile</button>
          </div>
        </div>

        {/* Process Steps */}
        {/* What happens next? Section */}
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-8 text-center">What happens next?</h3>
          
          <div className="flex justify-between items-start relative">
            {/* Connecting Line - පියවර සම්බන්ධ කරන රේඛාව */}
            <div className="absolute top-[20px] left-[10%] right-[10%] h-[2px] bg-gray-100 -z-0"></div>

            {[
              { step: "1", label: "Profile Created" },
              { step: "2", label: "Under Review" },
              { step: "3", label: "Opportunity Matching" },
              { step: "4", label: "Recruiter Contact" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#0b5d90] text-white flex items-center justify-center font-bold shadow-md">
                  {item.step}
                </div>
                <p className="text-xs font-bold text-gray-600 text-center w-24">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}