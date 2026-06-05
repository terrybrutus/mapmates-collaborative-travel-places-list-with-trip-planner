import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

const WALKTHROUGH_KEY = "mapmates_walkthrough_done";

interface Step {
  title: string;
  description: string;
  emoji: string;
  highlight?: string; // ocid to highlight
}

const STEPS: Step[] = [
  {
    title: "Welcome to MapMates! 🌍",
    description:
      "This quick tour shows you the main features. You can skip at any time — just click the × button or press Escape.",
    emoji: "👋",
  },
  {
    title: "Your Places",
    description:
      "The Places tab is your home base. Browse all your saved destinations, search by country or city, filter by status, and organize everything in one view.",
    emoji: "📍",
    highlight: "nav.places_tab",
  },
  {
    title: "Add New Places",
    description:
      'Click the blue dropdown button at the top of the Places page and choose "Add New Place" to save a new destination. Fill in the country, city, status, notes, and more.',
    emoji: "➕",
  },
  {
    title: "Pick a Random Place",
    description:
      'Use "Random Pick" from the Places dropdown to get a surprise destination from your list — great for deciding where to go next!',
    emoji: "🎲",
  },
  {
    title: "Trip Planner",
    description:
      "Head to the Trip Planner tab to build itineraries. Create a new trip, select places from your saved list, and the app will calculate distances between stops.",
    emoji: "✈️",
    highlight: "nav.trips_tab",
  },
  {
    title: "Statistics",
    description:
      "The Statistics tab gives you an overview of your travel data — total places, countries visited, status breakdowns, and more.",
    emoji: "📊",
    highlight: "nav.stats_tab",
  },
  {
    title: "Activity Log",
    description:
      "See a timeline of all actions across your account — places added, trips created, and more — in the Activity Log tab.",
    emoji: "📋",
    highlight: "nav.activity_tab",
  },
  {
    title: "You're all set!",
    description:
      "That's everything you need to get started. Add your first place, build a trip, and start exploring the world with MapMates!",
    emoji: "🚀",
  },
];

export default function FirstTimeWalkthrough() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(WALKTHROUGH_KEY);
    if (!done) {
      // Small delay so the dashboard has time to mount
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(WALKTHROUGH_KEY, "1");
    setVisible(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        localStorage.setItem(WALKTHROUGH_KEY, "1");
        setVisible(false);
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setStep((s) => Math.max(s - 1, 0));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible]);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Subtle backdrop — doesn't block interaction */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Walkthrough card — anchored bottom-right */}
      <dialog
        open
        className="fixed bottom-6 right-6 z-50 w-full max-w-sm m-0 p-0 border-0 bg-transparent"
        aria-label="Feature walkthrough"
        data-ocid="walkthrough.dialog"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-5">
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {current.emoji}
                </span>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">
                  {current.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg -mr-1 -mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Skip walkthrough"
                data-ocid="walkthrough.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {current.description}
            </p>

            {/* Step counter + nav */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {step + 1} of {STEPS.length}
              </span>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Previous step"
                    data-ocid="walkthrough.prev_button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {isLast ? (
                  <button
                    type="button"
                    onClick={dismiss}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    data-ocid="walkthrough.finish_button"
                  >
                    Get Started!
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    data-ocid="walkthrough.next_button"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1 mt-3">
              {STEPS.map((_, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: step index is stable
                  key={i}
                  type="button"
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    i === step
                      ? "w-4 h-2 bg-blue-600"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

/** Call this to reset the walkthrough (useful for testing) */
export function resetWalkthrough() {
  localStorage.removeItem(WALKTHROUGH_KEY);
}
