
"use client";

import { gql, useQuery } from "@apollo/client";

const GET_WORKOUTS = gql`
  query GetWorkouts {
    workouts {
      id
      title
      description
    }
  }
`;

export default function TousLesEntrainementsPage() {
    const { data, loading, error } = useQuery(GET_WORKOUTS);

    if (loading) return <p>Chargement…</p>;
    if (error) return <p>Erreur: {error.message}</p>;

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Entraînements disponibles</h1>
            <ul className="space-y-4">
                {data.workouts.map((workout: any) => (
                    <li
                        key={workout.id}
                        className="border p-4 rounded-lg shadow hover:shadow-md transition"
                    >
                        <h2 className="text-lg font-semibold">{workout.title}</h2>
                        <p className="text-gray-600">{workout.description}</p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
