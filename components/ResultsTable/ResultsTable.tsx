import Link from "next/link";
import { Badge } from "@/components/Badge/Badge";
import { formatMemberCount } from "@/lib/format";
import { toneForPace, toneForVisibility } from "@/lib/tone";
import type { Team } from "@/lib/types";

interface ResultsTableProps {
  teams: Team[];
}

export function ResultsTable({ teams }: ResultsTableProps) {
  if (teams.length === 0) {
    return (
      <div>
        <p>No teams match that search.</p>
        <p>Try a broader keyword or clear a filter.</p>
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Location</th>
          <th>Bike type</th>
          <th>Pace</th>
          <th>Members</th>
          <th>Visibility</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr key={team.id}>
            <td>
              <Link href={`/teams/${team.id}`}>
                {team.name}
              </Link>
            </td>
            <td>
              <Badge tone="ink">{team.type}</Badge>
            </td>
            <td>{team.location}</td>
            <td>{team.bikeType}</td>
            <td>
              <Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
            </td>
            <td>{formatMemberCount(team.memberCount)}</td>
            <td>
              <Badge tone={toneForVisibility(team.visibility)}>{team.visibility}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
