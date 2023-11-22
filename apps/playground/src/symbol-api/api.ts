/*
export async function getBackendRequest(
	relativeUrl: string,
	headers: Record<string, string> = {}
): Promise<BackendRequest> {
	const env = getAppEnvDetails();
	const slash = relativeUrl[0] === "/" ? "" : "/";
	const fullUrl = env.backendEndpoint.host + slash + relativeUrl;
}

export const sparqlResponseFormat = [
	"text/turtle",
	"application/ld+json",
	"application/rdf+xml",
	"application/sparql-results+json",
] as const;
*/

import { UiSymbol } from "@equinor/rdf-graph";
import { jsonLdResponseToUiSymbol } from "./utils/jsonld-to-uisymbol";
import { Console } from "console";

export async function fetchAllSymbols(): Promise<UiSymbol[]> {
    const response = await fetch("https://dev-engsym-api.azurewebsites.net/symbols");
	const content = await response.text();
	console.log("Symbols loaded");

    return jsonLdResponseToUiSymbol(JSON.parse(content));
}