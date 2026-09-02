import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id?: string | number;
    title: string;
    time?: string;
    date?: string;
    location?: string;
    organizer?: string;
  };
  onSuccess: () => void;
}

export function EventRegistrationModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EventRegistrationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendees, setAttendees] = useState("1");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
        setName("");
        setEmail("");
        setPhone("");
        setNote("");
      }, 1400);
    }, 500);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSubmitted(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-2xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-foreground">Event Registration</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs animate-in zoom-in-75 duration-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Registration Confirmed!</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your spot has been reserved for <strong className="text-slate-800">{event.title}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-[#C04A22]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Mohammad Rahman"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-[#C04A22]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. rahman@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] transition-colors"
                />
              </div>

              {/* Phone & Attendees in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Seats
                  </label>
                  <select
                    value={attendees}
                    onChange={e => setAttendees(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] transition-colors bg-white cursor-pointer"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 Persons</option>
                    <option value="3">3 Persons</option>
                    <option value="4">4 Persons</option>
                    <option value="5+">5+ Persons</option>
                  </select>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Note or Questions (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Any special accommodations or questions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Confirm Registration"}
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
}
