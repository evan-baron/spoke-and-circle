import type { Metadata } from 'next';
import { LegalDocument } from '@/components/LegalDocument/LegalDocument';
import { SITE_NAME, SUPPORT_EMAIL } from '@/lib/siteConfig';

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description: `How ${SITE_NAME} collects, uses, and protects your information.`,
	alternates: { canonical: '/privacy' },
	robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'September 28, 2026';

export default function PrivacyPage() {
	return (
		<LegalDocument title='Privacy Policy' effectiveDate={EFFECTIVE_DATE}>
			<p>
				{SITE_NAME} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) helps riders find
				cycling teams, clubs, and group rides, and helps those groups list
				themselves so riders can find them. This policy explains what
				information we collect, why, and how it&rsquo;s used.
			</p>

			<section>
				<h2>Information we collect</h2>
				<h3>Account information</h3>
				<p>
					If you sign in (for example to submit a team, or as an
					administrator), authentication is handled by Auth0. Depending on
					how you sign in, we receive your email address, name, and, if you
					use a social login, whatever basic profile info that provider
					shares. We store this alongside an internal role (regular user or
					admin) and whether your account is active.
				</p>
				<h3>Team and group listings</h3>
				<p>
					When you submit a team, club, or group ride, you provide the
					details that make up the public listing: name, description,
					location, ride details, and any contact information you choose to
					include (email, phone, website, social links). You control what
					contact information, if any, goes on a public listing.
				</p>
				<h3>Contact form</h3>
				<p>
					If you use the contact form, we collect the name, email address,
					and message you provide, so we can reply to you.
				</p>
				<h3>Automatically collected information</h3>
				<p>
					We temporarily log your IP address to enforce rate limits that
					prevent spam and abuse (for example, limiting how many team
					submissions or location searches can come from one address in a
					short window). These records are short-lived and routinely cleaned
					up; they are not used to track you across the site or build a
					profile of you.
				</p>
				<p>
					We also use Google Analytics to understand how the site is used
					(pages visited, general location derived from IP address, device
					and browser type, how you arrived at the site, and how you
					interact with it, such as which steps of a form you reach). We don&rsquo;t
					enable Google Signals or link this data to Google Ads, so it
					isn&rsquo;t used for cross-site advertising or to build ad profiles
					about you.
				</p>
				<h3>Location search</h3>
				<p>
					When you search by city, ZIP code, or state, we match your search
					text against a public geographic database (U.S. Census Bureau
					place data and GeoNames). We do not access your device&rsquo;s
					precise location, and the site does not request geolocation
					permissions.
				</p>
			</section>

			<section>
				<h2>How we use information</h2>
				<ul>
					<li>To operate and display team, club, and group ride listings.</li>
					<li>
						To authenticate accounts and determine what actions you&rsquo;re
						allowed to take (for example, admin review of submissions).
					</li>
					<li>
						To send transactional email about your submission, such as
						approval or rejection notices, and to respond to messages sent
						through the contact form.
					</li>
					<li>To detect and prevent spam, abuse, and automated submissions.</li>
					<li>To maintain, secure, and improve the site.</li>
					<li>
						To understand aggregate site usage and improve the experience,
						via Google Analytics.
					</li>
				</ul>
				<p>
					We do not sell your information, and we do not use it for
					advertising. We do not run ad-tracking scripts on this site.
				</p>
			</section>

			<section>
				<h2>What&rsquo;s public</h2>
				<p>
					Approved team, club, and group ride listings are publicly visible
					on the site, including any contact details the submitter chose to
					include on that listing. If you submitted a listing and want
					contact information removed or changed, or want the listing
					removed entirely, contact us at{' '}
					<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
				</p>
			</section>

			<section>
				<h2>Sharing with service providers</h2>
				<p>
					We share information with the third-party services that run the
					site, only as needed to provide it:
				</p>
				<ul>
					<li>
						<strong>Auth0</strong>: authentication and account sign-in.
					</li>
					<li>
						<strong>Resend</strong>: delivery of transactional email
						(approval, rejection, and contact-form replies).
					</li>
					<li>
						<strong>Neon</strong>: our database, where account and listing
						data is stored.
					</li>
					<li>
						<strong>Vercel</strong> and <strong>Cloudflare</strong>:
						application hosting, content delivery, and network security.
					</li>
					<li>
						<strong>Google Analytics</strong>: aggregate site usage
						statistics.
					</li>
				</ul>
				<p>
					These providers process information on our behalf and are not
					permitted to use it for their own purposes. We may also disclose
					information if required by law, or to protect the security of the
					site.
				</p>
			</section>

			<section>
				<h2>Data retention</h2>
				<p>
					We keep account and listing data for as long as your account or
					listing is active. If a listing owner requests removal, the listing
					is scheduled for deletion rather than removed instantly, so an
					accidental request can be undone within a short window before it is
					permanently deleted. Rate-limit records are deleted automatically
					after they expire.
				</p>
			</section>

			<section>
				<h2>Cookies</h2>
				<p>
					We use cookies necessary to keep you signed in (managed by Auth0)
					and to protect the site during login. We also use Google Analytics
					cookies to measure site usage in aggregate. We don&rsquo;t use
					advertising or cross-site tracking cookies.
				</p>
			</section>

			<section>
				<h2>Children&rsquo;s privacy</h2>
				<p>
					{SITE_NAME} is not directed at children under 13, and we do not
					knowingly collect personal information from children under 13.
					Some listings describe youth cycling programs, but those listings
					are informational only. Submitting or browsing a listing is not
					something we expect a child to do themselves.
				</p>
			</section>

			<section>
				<h2>Your choices</h2>
				<p>
					You can ask us to access, correct, or delete the personal
					information we hold about you, or ask us to remove a listing, by
					emailing <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
				</p>
			</section>

			<section>
				<h2>Your California privacy rights (CCPA/CPRA)</h2>
				<p>
					If you&rsquo;re a California resident, the California Consumer
					Privacy Act, as amended by the California Privacy Rights Act
					(CCPA/CPRA), gives you additional rights over the personal
					information we hold about you.
				</p>
				<h3>Categories of personal information we collect</h3>
				<p>In the past 12 months, we&rsquo;ve collected:</p>
				<ul>
					<li>
						<strong>Identifiers</strong>: name, email address, and IP
						address.
					</li>
					<li>
						<strong>Internet or network activity</strong>: IP address and
						request metadata used to enforce rate limits, and site usage
						data (pages visited, device/browser type, referring site, and
						interactions such as which form steps you reach) collected via
						Google Analytics.
					</li>
					<li>
						<strong>Information you submit</strong>: team/group listing
						details and contact-form messages.
					</li>
				</ul>
				<p>
					We do not collect sensitive personal information (such as precise
					geolocation, government IDs, or financial account details), and we
					do not use personal information to make automated decisions that
					produce legal or similarly significant effects.
				</p>
				<h3>Your rights</h3>
				<ul>
					<li>
						<strong>Right to know</strong> what personal information we&rsquo;ve
						collected about you and how it&rsquo;s used.
					</li>
					<li>
						<strong>Right to delete</strong> personal information we hold
						about you, subject to certain legal exceptions.
					</li>
					<li>
						<strong>Right to correct</strong> inaccurate personal information.
					</li>
					<li>
						<strong>Right to opt out of sale or sharing.</strong> We don&rsquo;t
						sell personal information, and Google Analytics is configured
						without Google Signals or Google Ads linking, so we don&rsquo;t
						share personal information for cross-context behavioral
						advertising. There&rsquo;s nothing to opt out of today.
					</li>
					<li>
						<strong>Right to non-discrimination</strong> for exercising any of
						these rights.
					</li>
				</ul>
				<p>
					To exercise any of these rights, email{' '}
					<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We may need
					to verify your identity before completing a request (for example, by
					confirming it comes from the email address on file). You may also
					designate an authorized agent to make a request on your behalf.
				</p>
			</section>

			<section>
				<h2>Changes to this policy</h2>
				<p>
					If we make material changes to this policy, we&rsquo;ll update the
					effective date above.
				</p>
			</section>

			<section>
				<h2>Contact us</h2>
				<p>
					Questions about this policy? Email{' '}
					<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
				</p>
			</section>
		</LegalDocument>
	);
}
