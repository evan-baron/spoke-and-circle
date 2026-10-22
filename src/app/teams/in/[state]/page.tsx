import type { Metadata } from 'next';
import {
	StateLanding,
	getStateLandingMetadata,
} from '@/components/search/StateLanding/StateLanding';

interface StatePageParams {
	state: string;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<StatePageParams>;
}): Promise<Metadata> {
	const { state } = await params;
	return getStateLandingMetadata('teams', state);
}

export default async function TeamsInStatePage({
	params,
}: {
	params: Promise<StatePageParams>;
}) {
	const { state } = await params;
	return <StateLanding kind='teams' slug={state} />;
}
