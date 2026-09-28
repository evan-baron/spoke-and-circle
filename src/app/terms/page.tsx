import type { Metadata } from 'next';
import { LegalDocument } from '@/components/LegalDocument/LegalDocument';
import { SITE_NAME, SUPPORT_EMAIL } from '@/lib/siteConfig';

export const metadata: Metadata = {
	title: 'Terms of Service',
	description: `The terms that govern use of ${SITE_NAME}.`,
	alternates: { canonical: '/terms' },
	robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'September 28, 2026';

export default function TermsPage() {
	return (
		<LegalDocument title='Terms of Service' effectiveDate={EFFECTIVE_DATE}>
			<p>
				These Terms of Service (&ldquo;Terms&rdquo;) govern your use of{' '}
				{SITE_NAME} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; the
				&ldquo;site&rdquo;). By using the site, you agree to these Terms.
			</p>

			<section>
				<h2>What {SITE_NAME} is</h2>
				<p>
					{SITE_NAME} is a directory: it lets riders search for cycling
					teams, clubs, and group rides, and lets those groups submit
					listings so riders can find them. We don&rsquo;t organize, host,
					lead, or supervise any ride, event, or group listed on the site,
					and we are not a party to any relationship between you and a group
					you contact or join through the site.
				</p>
			</section>

			<section>
				<h2>Accounts</h2>
				<p>
					Some actions, like submitting or managing a listing, may require
					signing in. You&rsquo;re responsible for maintaining access to
					your account and for anything that happens under it. Accounts may
					be disabled for violating these Terms.
				</p>
			</section>

			<section>
				<h2>Submitting a listing</h2>
				<ul>
					<li>
						You must have the authority to submit information about a team,
						club, or group ride, and the information must be accurate and not
						misleading.
					</li>
					<li>
						Submissions are reviewed before they appear publicly, and we may
						approve, reject, edit for clarity or formatting, or remove any
						listing at our discretion, for example if it&rsquo;s spam,
						inaccurate, abusive, or violates these Terms.
					</li>
					<li>
						By submitting a listing, you grant us a non-exclusive,
						royalty-free license to display that content on the site for as
						long as the listing is active.
					</li>
					<li>
						You may request that your listing be corrected or removed by
						emailing <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
					</li>
				</ul>
			</section>

			<section>
				<h2>Prohibited conduct</h2>
				<p>You agree not to:</p>
				<ul>
					<li>
						Submit false, misleading, or spam listings, or submit a listing
						for a group you don&rsquo;t have the authority to represent.
					</li>
					<li>
						Scrape, crawl, or use automated means to access the site beyond
						normal, reasonable use, or attempt to bypass rate limits or other
						technical protections.
					</li>
					<li>
						Use the site to harass, impersonate, or misrepresent yourself or
						others.
					</li>
					<li>Attempt to gain unauthorized access to accounts or data.</li>
				</ul>
			</section>

			<section>
				<h2>Third-party groups and rides</h2>
				<p>
					{SITE_NAME} is a directory only. We review submissions for basic
					accuracy and formatting, but we don&rsquo;t vet, endorse, or
					guarantee the accuracy of any listing, and we have no control over
					how a listed group operates. Riding a bike, and group cycling in
					particular, carries inherent risk. Any decision to contact, join,
					or ride with a group you find through the site is your own, and you
					do so at your own risk. To the fullest extent permitted by law, we
					are not liable for any injury, loss, dispute, or damage arising
					from your interactions with a listed group or participation in a
					listed ride or event.
				</p>
			</section>

			<section>
				<h2>Disclaimer of warranties</h2>
				<p>
					The site is provided &ldquo;as is&rdquo; and &ldquo;as
					available,&rdquo; without warranties of any kind, express or
					implied. We don&rsquo;t guarantee that listings are accurate,
					complete, or current, or that the site will be uninterrupted or
					error-free.
				</p>
			</section>

			<section>
				<h2>Limitation of liability</h2>
				<p>
					To the fullest extent permitted by law, {SITE_NAME} and its
					operators are not liable for any indirect, incidental, or
					consequential damages arising from your use of the site.
				</p>
			</section>

			<section>
				<h2>Termination</h2>
				<p>
					We may suspend or terminate your access, or remove a listing, at
					any time for conduct that violates these Terms or that we believe
					is harmful to the site or other users.
				</p>
			</section>

			<section>
				<h2>Changes</h2>
				<p>
					We may update these Terms from time to time. If we make material
					changes, we&rsquo;ll update the effective date above. Continued use
					of the site after a change means you accept the updated Terms.
				</p>
			</section>

			<section>
				<h2>Contact us</h2>
				<p>
					Questions about these Terms? Email{' '}
					<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
				</p>
			</section>
		</LegalDocument>
	);
}
