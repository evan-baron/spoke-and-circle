"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const CLUB_TYPES = ["Team", "Club", "Group", "Organization"];
const BIKE_TYPES = ["Road", "Gravel", "MTB", "Track", "Tri", "E-bike", "Mixed"];
const FORMATS = ["In-person", "Virtual", "Hybrid"];
const VIRTUAL_PLATFORMS = ["Zwift", "Strava", "TrainerRoad", "Other"];
const SCHEDULES = ["Weekly", "Monthly", "Annually"];
const PACES = ["Casual", "Steady", "Competitive"];
const SEGMENTATIONS = ["A Group", "B Group", "C Group", "N/A"];
const DROP_POLICIES = ["Drop", "No-drop"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const RANKING_SYSTEMS = ["Captains", "Ride Leaders", "Liaison", "N/A"];

interface FieldProps {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      {children}
      {hint && <span>{hint}</span>}
    </label>
  );
}

interface CheckboxProps {
  label: string;
  name: string;
}

function Checkbox({ label, name }: CheckboxProps) {
  return (
    <label>
      <input type="checkbox" name={name} />
      <span>{label}</span>
    </label>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {description && <p>{description}</p>}
      <div>{children}</div>
    </fieldset>
  );
}

export default function NewTeamPage() {
  const { role } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const isAdmin = role === "admin";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main>
        <div>
          <div>
            <p>&#10003;</p>
            <h1>
              {isAdmin ? "Team added" : "Submission received"}
            </h1>
            <p>
              {isAdmin
                ? "In a live version of this app, the new team would now be published and searchable."
                : "In a live version of this app, an admin would review this submission before it appears in search results."}{" "}
              This is a wireframe, so nothing was actually saved.
            </p>
            <div>
              <Link href="/search">
                Back to search
              </Link>
              <button type="button" onClick={() => setSubmitted(false)}>
                Submit another
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div>
        <Link href="/search">
          &larr; Back to search
        </Link>

        <header>
          <p>{isAdmin ? "Admin" : "Member"} tools</p>
          <h1>{isAdmin ? "Add a new team" : "Submit a new team"}</h1>
          <p>
            {isAdmin
              ? "Published immediately once submitted — fill in as much as you have, the rest can be edited later."
              : "Send a team, club, or group for an admin to review. They may follow up with you before it goes live."}
          </p>
          {role === "guest" && (
            <p>
              You&rsquo;re viewing as a guest. Switch to Member or Admin in the header to see how this form is
              framed for each role.
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit}>
          <Section title="Generic info">
            <Field label="Name">
              <input type="text" name="name" required placeholder="e.g. Portland Velo Collective" />
            </Field>
            <Field label="Type">
              <select name="type" defaultValue="Club">
                {CLUB_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mission statement" full>
              <textarea name="missionStatement" rows={2} placeholder="What is this group trying to do?" />
            </Field>
            <Field label="Code of conduct" full>
              <textarea name="codeOfConduct" rows={2} placeholder="Any ground rules for members and rides" />
            </Field>
            <Field label="Affiliation">
              <input type="text" name="affiliation" placeholder="e.g. USA Cycling Club Member" />
            </Field>
            <Field label="Location">
              <input type="text" name="location" required placeholder="City, State" />
            </Field>
            <Field label="Additional locations" hint="Comma-separated">
              <input type="text" name="additionalLocations" placeholder="e.g. Beaverton, OR" />
            </Field>
            <Field label="Founded">
              <input type="number" name="founded" min={1970} max={2026} placeholder="2024" />
            </Field>
            <Field label="Public or private">
              <select name="visibility" defaultValue="Public">
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </Field>
            <Field label="Primary language">
              <input type="text" name="primaryLanguage" placeholder="English" />
            </Field>
            <Field label="Contact phone">
              <input type="tel" name="contactPhone" placeholder="555-555-0100" />
            </Field>
            <Field label="Contact email">
              <input type="email" name="contactEmail" placeholder="hello@yourteam.org" />
            </Field>
          </Section>

          <Section title="Details">
            <Field label="Bike type">
              <select name="bikeType" defaultValue="Road">
                {BIKE_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Virtual or in-person">
              <select name="format" defaultValue="In-person">
                {FORMATS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Virtual platform">
              <select name="virtualPlatform" defaultValue="">
                <option value="">N/A</option>
                {VIRTUAL_PLATFORMS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Home-base affiliation">
              <input type="text" name="homeBaseAffiliation" placeholder="e.g. Zwift Racing League" />
            </Field>
            <Field label="Website">
              <input type="url" name="website" placeholder="https://" />
            </Field>
            <Field label="Instagram">
              <input type="text" name="instagram" placeholder="@yourteam" />
            </Field>
            <Field label="Facebook">
              <input type="text" name="facebook" placeholder="Page name" />
            </Field>
            <Field label="Strava">
              <input type="text" name="strava" placeholder="Club name" />
            </Field>
            <Field label="Discord">
              <input type="text" name="discord" placeholder="discord.gg/&hellip;" />
            </Field>
            <Field label="Minimum age">
              <input type="number" name="ageMin" min={0} max={120} />
            </Field>
            <Field label="Maximum age">
              <input type="number" name="ageMax" min={0} max={120} />
            </Field>
            <Field label="Starting member count">
              <input type="number" name="memberCount" min={0} />
            </Field>
            <Field label="Maximum member limit">
              <input type="number" name="memberLimit" min={0} />
            </Field>
            <Field label="How to join" full>
              <textarea name="howToJoin" rows={2} placeholder="What should a prospective member do?" />
            </Field>

            <div>
              <span>Persona restrictions</span>
              <div>
                <Checkbox label="Women only" name="personaWomenOnly" />
                <Checkbox label="Men only" name="personaMenOnly" />
                <Checkbox label="LGBT only" name="personaLgbtOnly" />
              </div>
            </div>
            <div>
              <Checkbox label="E-bike allowed" name="eBikeAllowed" />
              <Checkbox label="Waitlist active" name="waitlist" />
            </div>
          </Section>

          <Section title="Ride details">
            <Field label="Schedule">
              <select name="rideSchedule" defaultValue="Weekly">
                {SCHEDULES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Start times" hint="Comma-separated">
              <input type="text" name="startTimes" placeholder="e.g. Tue 6:00 PM, Sat 8:00 AM" />
            </Field>
            <Field label="Pace">
              <select name="pace" defaultValue="Steady">
                {PACES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Segmentation">
              <select name="segmentation" defaultValue="N/A">
                {SEGMENTATIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Typical distance" hint="Miles">
              <input type="number" name="typicalDistanceMiles" min={0} />
            </Field>
            <Field label="Typical elevation gain" hint="Feet">
              <input type="number" name="typicalElevationGainFt" min={0} />
            </Field>
            <Field label="Drop or no-drop">
              <select name="dropPolicy" defaultValue="No-drop">
                {DROP_POLICIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ride visibility">
              <select name="rideVisibility" defaultValue="Public">
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </Field>
          </Section>

          <Section title="Team / club details">
            <Field label="Competitive or casual">
              <select name="competitiveOrCasual" defaultValue="Casual">
                <option value="Casual">Casual</option>
                <option value="Competitive">Competitive</option>
              </select>
            </Field>
            <Field label="Skill level">
              <select name="skillLevel" defaultValue="Intermediate">
                {SKILL_LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Dues amount" hint="Leave blank if none">
              <input type="text" name="duesAmount" placeholder="e.g. $150/year" />
            </Field>
            <Field label="Dues schedule">
              <select name="duesSchedule" defaultValue="Annually">
                {SCHEDULES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Required races" hint="Minimum per season">
              <input type="number" name="requiredRaces" min={0} />
            </Field>
            <Field label="Mileage requirement" hint="Minimum miles">
              <input type="number" name="mileageMin" min={0} />
            </Field>
            <Field label="Mileage frequency">
              <select name="mileageFrequency" defaultValue="Monthly">
                {SCHEDULES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rankings">
              <select name="rankingSystem" defaultValue="N/A">
                {RANKING_SYSTEMS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sponsors" hint="Comma-separated" full>
              <input type="text" name="sponsors" placeholder="e.g. Lone Star Bikes, Velocity Nutrition" />
            </Field>

            <div>
              <span>Team attributes</span>
              <div>
                <Checkbox label="Instructional" name="instructional" />
                <Checkbox label="Dues required" name="duesRequired" />
                <Checkbox label="Required rides" name="requiredRides" />
                <Checkbox label="Required kit / uniform" name="requiredKit" />
                <Checkbox label="Public roster" name="hasRoster" />
              </div>
            </div>

            <div>
              <span>Event types</span>
              <div>
                <Checkbox label="Sponsor events" name="eventSponsor" />
                <Checkbox label="Team-specific events" name="eventTeamSpecific" />
                <Checkbox label="Public events" name="eventPublic" />
                <Checkbox label="Recruiting events" name="eventRecruiting" />
              </div>
            </div>

            <div>
              <span>Join / applicant requirements</span>
              <div>
                <Checkbox label="Try-outs required" name="joinTryouts" />
                <Checkbox label="Referral required" name="joinReferral" />
                <Checkbox label="Invite only" name="joinInviteOnly" />
                <Checkbox label="Open to all" name="joinOpen" />
              </div>
            </div>
          </Section>

          <div>
            <p>
              This is a wireframe &mdash; submitting won&rsquo;t save any data.
            </p>
            <button type="submit">
              {isAdmin ? "Add team" : "Submit for review"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
