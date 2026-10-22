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
	return getStateLandingMetadata('rides', state);
}

export default async function GroupRidesInStatePage({
	params,
}: {
	params: Promise<StatePageParams>;
}) {
	const { state } = await params;
	return <StateLanding kind='rides' slug={state} />;
}
