"use client";

import { useEffect, useMemo, useState } from "react";
import { GoalType, GenderType } from "@prisma/client";
import { calculateCalorieTarget } from "@/lib/calculations";
import { GlassCard } from "@/components/GlassCard";
import { SegmentedControl } from "@/components/SegmentedControl";

type ProfilePayload = {
  weight: number;
  height: number;
  age: number;
  gender: GenderType;
  goal: GoalType;
  calorieTarget: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (res.ok) {
        setProfile(await res.json());
      }
    };
    load();
  }, []);

  const autoTarget = useMemo(() => {
    if (!profile) return 0;
    return calculateCalorieTarget(profile);
  }, [profile]);

  const onSave = async () => {
    if (!profile) return;
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, calorieTarget: autoTarget }),
    });
    if (res.ok) {
      setMessage("Profile saved.");
      setProfile(await res.json());
    }
  };

  if (!profile) return <p className="text-sm text-gray-600 dark:text-gray-300">Loading profile...</p>;

  return (
    <GlassCard className="space-y-4 p-5" interactive>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Weight (kg)
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
            className="mt-1 min-h-12 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
        </label>

        <label className="text-sm text-gray-700 dark:text-gray-300">
          Height (cm)
          <input
            type="number"
            value={profile.height}
            onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
            className="mt-1 min-h-12 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
        </label>

        <label className="text-sm text-gray-700 dark:text-gray-300">
          Age
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
            className="mt-1 min-h-12 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
          />
        </label>

        <label className="text-sm text-gray-700 dark:text-gray-300">
          Gender
          <SegmentedControl
            value={profile.gender}
            onChange={(value) => setProfile({ ...profile, gender: value as GenderType })}
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
          />
        </label>

        <label className="text-sm text-gray-700 dark:text-gray-300 sm:col-span-2">
          Goal
          <SegmentedControl
            value={profile.goal}
            onChange={(value) => setProfile({ ...profile, goal: value as GoalType })}
            options={[
              { label: "Lose", value: "lose" },
              { label: "Maintain", value: "maintain" },
              { label: "Gain", value: "gain" },
            ]}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-white/20 bg-white/60 p-3 text-sm text-emerald-700 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60 dark:text-emerald-300">
        Auto calculated calorie target: <span className="font-semibold">{autoTarget} kcal</span>
      </div>

      <button
        onClick={onSave}
        className="min-h-12 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        Save preferences
      </button>
      {message && <p className="text-sm text-emerald-600 dark:text-emerald-300">{message}</p>}
    </GlassCard>
  );
}
