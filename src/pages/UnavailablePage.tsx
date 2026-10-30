import { Link } from "react-router";
import PageTitle from "../components/layout/PageTitle";

export default function UnavailablePage({
	studio
}: {
	studio: boolean;
}) {
	return (
		<div className="app-layout">
			<PageTitle
				title={"Page unavailable — Plotstrand" + (studio ? " Studio" : "")}
			/>

			<main className="main-content">
				<h1>Page unavailable</h1>

				<p>
					This address may be incorrect, or the timeline
					may no longer be available.
				</p>

				<p>
					<Link
						className="utility-button"
						to={studio ? "/studio" : "/"}
					>
						All franchises
					</Link>
				</p>
			</main>
		</div>
	)
}