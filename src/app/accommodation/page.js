"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Calendar, Clock, Train, Plane, Bus, Car } from "lucide-react";

export default function AccommodationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    teamName: "",
    modeOfTravel: "train",
    arrivalDate: "",
    arrivalTime: "",
    departureDate: "",
    departureTime: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally this would send data to a backend
    console.log("Accommodation Request:", formData);
    setIsSubmitted(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
            BASE <span className="text-neon-cyan text-glow-cyan">CAMP</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Secure your stay during RANBHOOMI. Provide your travel details to help us arrange the perfect accommodation for your team.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-lg border-t-4 border-t-electric-purple relative overflow-hidden">
          {isSubmitted ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="font-display font-bold text-3xl text-white mb-4">REQUEST RECEIVED</h2>
              <p className="text-gray-400">
                Your accommodation details have been logged in our system. 
                Our team will contact you shortly with confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-2">
                  <label className="text-sm font-display text-neon-cyan">FULL NAME</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-display text-neon-cyan">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-display text-neon-cyan">PHONE NUMBER</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                    placeholder="Contact number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-display text-neon-cyan">TEAM NAME (IF ANY)</label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                    placeholder="Your team's name"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-8">
                <h3 className="font-display font-bold text-xl text-white mb-6">TRAVEL DETAILS</h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-display text-electric-purple">MODE OF TRAVEL</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['train', 'plane', 'bus', 'car'].map((mode) => (
                        <label 
                          key={mode}
                          className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300
                            ${formData.modeOfTravel === mode 
                              ? 'bg-electric-purple/20 border-electric-purple text-electric-purple box-glow-purple' 
                              : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'}
                          `}
                        >
                          <input 
                            type="radio" 
                            name="modeOfTravel" 
                            value={mode} 
                            checked={formData.modeOfTravel === mode}
                            onChange={handleChange}
                            className="hidden" 
                          />
                          {mode === 'train' && <Train className="w-6 h-6" />}
                          {mode === 'plane' && <Plane className="w-6 h-6" />}
                          {mode === 'bus' && <Bus className="w-6 h-6" />}
                          {mode === 'car' && <Car className="w-6 h-6" />}
                          <span className="text-sm font-medium uppercase">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Arrival */}
                    <div className="bg-black/30 p-6 rounded border border-white/5 space-y-4">
                      <h4 className="font-display text-lg text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-neon-cyan" />
                        ARRIVAL
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block uppercase">Date</label>
                          <input
                            type="date"
                            name="arrivalDate"
                            required
                            value={formData.arrivalDate}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block uppercase">Time</label>
                          <input
                            type="time"
                            name="arrivalTime"
                            required
                            value={formData.arrivalTime}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Departure */}
                    <div className="bg-black/30 p-6 rounded border border-white/5 space-y-4">
                      <h4 className="font-display text-lg text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-electric-purple" />
                        DEPARTURE
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block uppercase">Date</label>
                          <input
                            type="date"
                            name="departureDate"
                            required
                            value={formData.departureDate}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-electric-purple"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block uppercase">Time</label>
                          <input
                            type="time"
                            name="departureTime"
                            required
                            value={formData.departureTime}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-electric-purple"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-electric-purple/20 border border-electric-purple text-electric-purple font-display font-bold tracking-wider hover:bg-electric-purple hover:text-white transition-all duration-300 box-glow-purple mt-8"
              >
                SUBMIT ACCOMMODATION REQUEST
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
