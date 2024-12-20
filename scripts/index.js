// globals
window._globals = {
	allRepos: undefined,
	sortFilterSearchRepos: undefined,
	ignoreNextHashChange: undefined,
	templates: {}
};

window.addEventListener("hashchange", updateUI);
function readableRepoName (sName) {
	let aWords = sName.split("-");
	if (aWords.length === 1) {
		aWords = sName.split("_");
	}
	aWords = aWords.map(
		(sWord) => sWord.charAt(0).toUpperCase() + sWord.slice(1)
	);
	return aWords.join(" ");
}

function createContent (aItems) {
	let oURL = new URL("https://dummy.com");
	oURL.search = window.location.hash.substring(1);
	const sDisplay = oURL.searchParams.get("display") || "card";
	const sResult = aItems.map((oItem) => generateItem(sDisplay, oItem)).join ("");
	updateContent(sDisplay, sResult, aItems);
}

function updateContent (sDisplay, sResult, aItems) {
	window.document.getElementById((sDisplay === "card" ? "card" : "row") + "s").innerHTML = sResult;
	window.document.getElementById("search").labels[0].innerText = `Pesquisa ${aItems.length} projetos.`;
	registerFallbackImage(window.document);
	M.Tooltip.init(window.document.querySelectorAll(".tooltipped"));
}
function updateUI () {
	if (window._globals.ignoreNextHashChange) {
		return;
	}
	window._globals.sortFilterSearchRepos = window._globals.allRepos;
	let oURL = new URL("https://dummy.com");
	oURL.search = window.location.hash.substring(1);
	oURL.searchParams.get("sort") && sort(oURL.searchParams.get("sort"));
	oURL.searchParams.get("filter") && filter(oURL.searchParams.get("filter"));
	oURL.searchParams.get("search") && search(oURL.searchParams.get("search"));
	oURL.searchParams.get("details") && showModal(parseInt(oURL.searchParams.get("details")) || oURL.searchParams.get("details"));
	display(oURL.searchParams.get("display") || "card");
}

function updateHash (sKey, sValue) {
	let oURL = new URL("https://dummy.com");
	oURL.search = window.location.hash.substring(1);
	sValue ? oURL.searchParams.set(sKey, sValue) : oURL.searchParams.delete(sKey);
	window._globals.ignoreNextHashChange = true;
	window.location.hash = oURL.searchParams.toString().replace("%21=", "!");
	setTimeout(function () {
		window._globals.ignoreNextHashChange = false;
	}, 1000);
}

function registerFallbackImage (oNode) {
	let aImages = oNode.getElementsByTagName("img");
	for (let i = 0; i < aImages.length; i++) {
		aImages[i].addEventListener("error", function () {
			Math.seedrandom(this.src);
			this.src = "images/default" + (Math.floor(Math.random() * 3) + 1) + ".png";
			Math.seedrandom();
		});
	}
}

function stringToColor (sString) {
	Math.seedrandom(sString);
	const rand = Math.random() * Math.pow(255,3);
	Math.seedrandom();

	let sColor = "#";
	for (let i = 0; i < 3; sColor += ("00" + ((rand >> i++ * 8) & 0xFF).toString(16)).slice(-2));
	return sColor;
}

function getRepoLanguage (sLanguage) {
	let sLanguageShort = "N/A";
	let sFontSize;

	if (sLanguage) {
		sLanguageShort = sLanguage;
		if(sLanguageShort.length > 4) {
			if (sLanguageShort.match(/[A-Z][a-z]+/g) && sLanguageShort.match(/[A-Z][a-z]+/g).length > 1) {
				sLanguageShort = sLanguageShort.match(/[A-Z][a-z]+/g).reduce((x, y) => x.substr(0,1) + y.substr(0, 1));
			} else if (sLanguageShort.match(/[auoie]+/g)) {
				while(sLanguageShort.match(/[auoie]+/g) && sLanguageShort.length > 4) {
					sLanguageShort = sLanguageShort.replace(/[auoie]{1}/, "");
				}
			}
			// shorten to 4 letters
			sLanguageShort = sLanguageShort.substr(0, 4);
		} else {
			// short enough
			sLanguageShort = sLanguage;
		}
		// scale down size with length of string
		if (sLanguageShort.length > 2) {
			sFontSize = 100 - (sLanguageShort.length - 2) * 10 + "%";
		}
	} else {
		sLanguage = "not available";
	}

	// a pseudo-random color coding and the shortened text
	return window._globals.templates.language({
		color: (sLanguageShort !== "N/A" ?  stringToColor(sLanguage) : ""),
		fontSize: sFontSize,
		language: sLanguage,
		languageShort: sLanguageShort
	});
}

function getRepoActivity (oRepo) {
	let sScoreIndicator = "<div class=\"tooltipped score\" data-position=\"top\" data-tooltip=\"Activity: not available\">N/A</div>",
		vScoreNumeric = "N/A";

	if (oRepo._InnerSourceMetadata && typeof oRepo._InnerSourceMetadata.score === "number") {
		sScoreIndicator = getActivityLogo(oRepo._InnerSourceMetadata.score);
		vScoreNumeric = oRepo._InnerSourceMetadata.score;
	}

	return [sScoreIndicator, vScoreNumeric];
}

function getActivityLogo (iScore) {
	let sLogo = "images/activity/0.png",
		sActivityLevel = "None";

	if (iScore > 2500) {
		sLogo = "images/activity/5.png";
		sActivityLevel = "Extremamente alto";
	} else if (iScore > 1000) {
		sLogo = "images/activity/4.png";
		sActivityLevel = "Muito alto";
	} else if (iScore > 300) {
		sLogo = "images/activity/3.png";
		sActivityLevel = "Alta";
	} else if (iScore > 150) {
		sLogo = "images/activity/2.png";
		sActivityLevel = "Moderada";
	} else if (iScore > 50) {
		sLogo = "images/activity/1.png";
		sActivityLevel = "Baixo";
	} else if (iScore > 5) {
		sLogo = "images/activity/0.png";
		sActivityLevel = "Muito baixo";
	}

	return window._globals.templates.score({
		"logo": sLogo,
		"level": sActivityLevel
	});
}

function getParticipationColor (iValue) {
	let iOpacity;
	if (!iValue) {
		return false;
	}
	if (iValue === 0) {
		iOpacity = 0;
	} else {
		iOpacity = Math.log(iValue)/4 + 0.03; // 50 = 1, scale logarithmically below
	}
	iOpacity = Math.min(1, iOpacity);
	return "rgba(50, 205, 50, " + iOpacity + ")";
}

function createParticipationChart (oRepo) {
	let aParticipation = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.participation;
	if (!aParticipation) {
		return "N/A";
	}
	const aPrevious12Weeks = aParticipation.slice(aParticipation.length - 13, aParticipation.length - 1).reverse();

	let iValue = aParticipation[aParticipation.length - 1];
	let oContext = {
		thisWeek: {
			"commits": iValue,
			"color": getParticipationColor(iValue)
		},
		"weeksPreviousLabel": undefined,
		"weeksPrevious": [],
		"weeksBeforeLabel": undefined,
		"weeksBefore": []
	};
	const iCreatedWeeksAgo = Math.ceil((Date.now() - new Date(oRepo.created_at).getTime()) / 1000 / 86400 / 7) - 1;
	let iCommitsWeeksBefore = 0;
	aPrevious12Weeks.forEach((iValue, iIndex) => {
		if (iIndex >= iCreatedWeeksAgo) {
			return;
		}
		iCommitsWeeksBefore += iValue;

		oContext.weeksPrevious.push({
			"commits": iValue,
			"color": getParticipationColor(iValue)
		});
	});
	oContext.weeksPreviousLabel = Math.min(12, iCreatedWeeksAgo) + " semanas: " + iCommitsWeeksBefore;
	const aPrevious9months = aParticipation.slice(1, aParticipation.length - 13).reverse();
	let iWeeksBefore = 0;
	let iCommitsMonthBefore = 0;
	aPrevious9months.forEach((iValue, iIndex) => {
		if (iIndex >= iCreatedWeeksAgo - 13) {
			return;
		}
		iCommitsMonthBefore += iValue;
		iWeeksBefore++;

		oContext.weeksBefore.push({
			"commits": iValue,
			"color": getParticipationColor(iValue)
		});
	});
	oContext.weeksBeforeLabel = (Math.floor(iWeeksBefore / 4) <= 1 ? iWeeksBefore + " semanas antes: " : Math.floor(iWeeksBefore / 4) + " meses antes: ") + iCommitsMonthBefore;

	return window._globals.templates.participation(oContext);
}
function showModal (vRepoId, oEvent) {
	if (oEvent && oEvent.target.href) {
		return;
	}
	const oRepo = window._globals.allRepos.filter(oRepo => oRepo.id === vRepoId).pop();

	let sLogoURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.logo
		? oRepo._InnerSourceMetadata.logo.startsWith("http") || oRepo._InnerSourceMetadata.logo.startsWith("./")
			? oRepo._InnerSourceMetadata.logo
			: "data/" + oRepo._InnerSourceMetadata.logo + (oRepo._InnerSourceMetadata.logo.split(".").pop() === "svg" ? "?sanitize=true" : "")
		: oRepo.owner.avatar_url;

	let sTitle = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.title
		? oRepo._InnerSourceMetadata.title
		: readableRepoName(oRepo.name);

	let sDescription = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.motivation
		? oRepo._InnerSourceMetadata.motivation
		: oRepo.description !== null
			? oRepo.description
			: "";

	let [sScoreIndicator, vScoreNumeric] = getRepoActivity(oRepo);

	let aSkills = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.skills
		? oRepo._InnerSourceMetadata.skills
		: oRepo.language ?
			[oRepo.language] :
			[];

	let aContributions = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.contributions && oRepo._InnerSourceMetadata.contributions.length
		? oRepo._InnerSourceMetadata.contributions
		: ["Any"];

	let sContributeURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs
		? oRepo._InnerSourceMetadata.docs
		: oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.guidelines
			? `${oRepo.html_url}/blob/${oRepo.default_branch}/${oRepo._InnerSourceMetadata.guidelines}`
			: oRepo.html_url;

	let oContext = {
		"id" : (typeof oRepo.id === "string" ? "'" + oRepo.id + "'" : oRepo.id),
		"mediaURL": sLogoURL,
		"title": sTitle,
		"repoURL": oRepo.html_url,
		"repoTitle": oRepo.owner.login + "/" + oRepo.name,
		"description": sDescription,
		"topics": oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.topics,
		"stars": oRepo.stargazers_count,
		"issues": oRepo.open_issues_count,
		"forks": oRepo.forks_count,
		"score": sScoreIndicator,
		"scoreNumeric": vScoreNumeric,
		"language": getRepoLanguage(oRepo.language),
		"skills": aSkills,
		"contributions": aContributions,
		"documentationURL": oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs,
		"createdAt": moment(oRepo.created_at).format("MMMM Do YYYY"),
		"lastUpdate": moment(oRepo.updated_at).fromNow(),
		"contributeURL": sContributeURL
	};
	const oModalWrapper = window.document.getElementById("modal-details");
	oModalWrapper.innerHTML = window._globals.templates.details(oContext);

	M.Modal.init(oModalWrapper, {
		onCloseEnd: () => {
			updateHash("details", undefined);
		}
	});
	M.Tooltip.init(oModalWrapper.querySelectorAll(".tooltipped"));

	registerFallbackImage(oModalWrapper);

	M.Modal.getInstance(oModalWrapper).open();
	oModalWrapper.getElementsByClassName("participationChart")[0].innerHTML = createParticipationChart(oRepo);
	updateHash("details", vRepoId);
}

function generateItem (sDisplay, oRepo) {
	let sLogoURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.logo
		? oRepo._InnerSourceMetadata.logo.startsWith("http") || oRepo._InnerSourceMetadata.logo.startsWith("./")
			? oRepo._InnerSourceMetadata.logo
			: "data/" + oRepo._InnerSourceMetadata.logo + (oRepo._InnerSourceMetadata.logo.split(".").pop() === "svg" ? "?sanitize=true" : "")
		: oRepo.owner.avatar_url;

	let sTitle = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.title
		? oRepo._InnerSourceMetadata.title
		: readableRepoName(oRepo.name);

	let sDescription = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.motivation
		? oRepo._InnerSourceMetadata.motivation
		: oRepo.description !== null
			? oRepo.description
			: "";

	let sContributeURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs
		? oRepo._InnerSourceMetadata.docs
		: oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.guidelines
			? `${oRepo.html_url}/blob/${oRepo.default_branch}/${oRepo._InnerSourceMetadata.guidelines}`
			: oRepo.html_url;

	let oContext = {
		"id" : (typeof oRepo.id === "string" ? "'" + oRepo.id + "'" : oRepo.id),
		"mediaURL": sLogoURL,
		"title": sTitle,
		"repoURL": oRepo.html_url,
		"repoTitle": oRepo.owner.login + "/" + oRepo.name,
		"description": sDescription,
		"stars": oRepo.stargazers_count,
		"issues": oRepo.open_issues_count,
		"forks": oRepo.forks_count,
		"score": getRepoActivity(oRepo)[0],
		"language": getRepoLanguage(oRepo.language),
		"contributeURL": sContributeURL
	};

	return window._globals.templates[sDisplay](oContext);
}
window.document.addEventListener("DOMContentLoaded", function() {
	let oXHR = new XMLHttpRequest();
	oXHR.open("GET", "repos.json");
	oXHR.onload = () => {
		if (oXHR.status === 200) {
			window._globals.allRepos = JSON.parse(oXHR.responseText);
			fillLanguageFilter();
			updateUI();
			window.document.getElementById("count").innerText = window._globals.allRepos.length;
		} else {
			console.log("Request failed.	Returned status of " + oXHR.status);
		}
	};
	oXHR.send();
	window._globals.templates.card = Handlebars.compile(window.document.getElementById("card-template").innerHTML);
	window._globals.templates.list = Handlebars.compile(window.document.getElementById("list-template").innerHTML);
	window._globals.templates.score = Handlebars.compile(window.document.getElementById("score-template").innerHTML);
	window._globals.templates.language = Handlebars.compile(window.document.getElementById("language-template").innerHTML);
	window._globals.templates.details = Handlebars.compile(window.document.getElementById("details-template").innerHTML);
	window._globals.templates.participation = Handlebars.compile(window.document.getElementById("participation-template").innerHTML);

	window.document.getElementById("sort").addEventListener("change", function () {
		sort(this.value);
	});
	window.document.getElementById("filter").addEventListener("change", function () {
		filter(this.value);
	});
	window.document.getElementById("search").addEventListener("keyup", function () {
		search(this.value);
	});
	window.document.getElementById("display").addEventListener("change", function () {
		display(this.checked ? "card" : "list");
	});
});

function fillLanguageFilter () {
	let aAllLanguages = [];
	window._globals.allRepos.map(repo => {
		if (repo.language && !aAllLanguages.includes(repo.language)) {
			aAllLanguages.push(repo.language);
		}
	});
	// sort alphabetically and reverse
	aAllLanguages = aAllLanguages.sort().reverse();
	// insert new items backwards between "All" and "Other"
	let oFilter = window.document.getElementById("filter");
	aAllLanguages.forEach(language => {
		let oOption = window.document.createElement("option");
		oOption.text = oOption.value = language;
		oFilter.add(oOption, 1);
	});
	// initialize all filters
	M.FormSelect.init(document.querySelectorAll("select"));
	addLanguageIconsToFilter();
}

// sneak in language icons
function addLanguageIconsToFilter() {
	let aItems = window.document.getElementById("filter").parentNode.getElementsByTagName("li");
	for (let i = 0; i < aItems.length; i++) {
		if (aItems[i].innerText !== "All" && aItems[i].innerText !== "Other") {
			aItems[i].innerHTML = getRepoLanguage(aItems[i].innerText) + aItems[i].innerHTML;
		}
	}
}

// sort the cards by chosen parameter (additive, combines filter or search)
function sort (sParam) {
	let aResult;
	if (["name", "full_name"].includes(sParam)) {
		// sort alphabetically
		aResult = window._globals.sortFilterSearchRepos.sort((a, b) => (b[sParam] < a[sParam] ? 1 : -1));
	} else if (sParam === "score" && window._globals.sortFilterSearchRepos[0]["_InnerSourceMetadata"]) {
		// sort by InnerSource score
		aResult = window._globals.sortFilterSearchRepos.sort(
			(a, b) =>
				b["_InnerSourceMetadata"]["score"] - a["_InnerSourceMetadata"]["score"]
		);
	} else {
		// sort numerically
		aResult = window._globals.sortFilterSearchRepos.sort((a, b) => b[sParam] - a[sParam]);
	}
	createContent(aResult);
	// update hash
	updateHash("sort", sParam);
	// update select
	let oSelect = window.document.getElementById("sort");
	for (let i = 0; i < oSelect.options.length; i++) {
		if (oSelect.options[i].value === sParam) {
			oSelect.selectedIndex = i;
		}
	}
	M.FormSelect.init(oSelect);
}

// filter the cards by chosen parameter (resets search)
function filter (sParam) {
	let aResult;
	if (sParam !== "All") {
		if (sParam === "N/A") { // other
			aResult = window._globals.allRepos.filter((repo) => repo.language === null || repo.language === undefined);
		} else {
			aResult = window._globals.allRepos.filter((repo) => repo.language === sParam);
		}
	} else {
		aResult = window._globals.allRepos;
	}
	createContent(aResult);
	window._globals.sortFilterSearchRepos = aResult;
	// update hash
	updateHash("search", undefined);
	updateHash("filter", sParam);
	// update select
	let oSelect = window.document.getElementById("filter");
	for (let i = 0; i < oSelect.options.length; i++) {
		if (oSelect.options[i].value === sParam) {
			oSelect.selectedIndex = i;
		}
	}
	M.FormSelect.init(oSelect);
	addLanguageIconsToFilter();
	// reset search
	window.document.getElementById("search").value = "";
}

// search the cards by chosen parameter (resets filter)
function search(sParam) {
	let sLowerCaseParam = sParam.toLowerCase();
	let oResult = window._globals.allRepos.filter(
		(repo) =>
			// name
			repo.full_name.toLowerCase().includes(sLowerCaseParam) ||
			// description
			(repo.description && repo.description.toLowerCase().includes(sLowerCaseParam)) ||
			// InnerSource metadata
			repo._InnerSourceMetadata && (
				// topics
				repo._InnerSourceMetadata.topics &&
				repo._InnerSourceMetadata.topics.join(" ").toLowerCase().includes(sLowerCaseParam) ||
				// custom title
				repo._InnerSourceMetadata.title &&
				repo._InnerSourceMetadata.title.toLowerCase().includes(sLowerCaseParam) ||
				// motivation
				repo._InnerSourceMetadata.motivation &&
				repo._InnerSourceMetadata.motivation.toLowerCase().includes(sLowerCaseParam) ||
				// skills
				repo._InnerSourceMetadata.skills &&
				repo._InnerSourceMetadata.skills.join(" ").toLowerCase().includes(sLowerCaseParam) ||
				// contributions
				repo._InnerSourceMetadata.contributions &&
				repo._InnerSourceMetadata.contributions.join(" ").toLowerCase().includes(sLowerCaseParam)
			)
	);
	window._globals.sortFilterSearchRepos = oResult;
	createContent(oResult);

	// update hash
	updateHash("search", sParam);
	updateHash("filter", undefined);
	// set search
	const oSearch = window.document.getElementById("search");
	oSearch.value = sParam;
	M.updateTextFields();
	// reset filter
	const oSelect = window.document.getElementById("filter");
	oSelect.selectedIndex = 0;
	M.FormSelect.init(oSelect);
	addLanguageIconsToFilter();
}

// toggles the display between card and table view
function display (sParam) {
	// update UI
	window.document.getElementById("display").checked = (sParam !== "list");
	// toggle active icon
	window.document.getElementsByClassName("switch")[0].getElementsByTagName("i")[sParam !== "list" ? 1 : 0].classList.add("active");
	window.document.getElementsByClassName("switch")[0].getElementsByTagName("i")[sParam !== "list" ? 0 : 1].classList.remove("active");
	// only create content when mode has changed
	if (!document.getElementById(sParam !== "list" ? "cards" : "rows").innerHTML) {
		// store context
		updateHash("display", sParam);
		// create content
		createContent(window._globals.sortFilterSearchRepos);
	}
	// toggle content
	window.document.getElementById(sParam !== "list" ? "rows" : "cards").innerHTML = "";
	window.document.getElementById(sParam !== "list" ? "cards" : "list").style.display = "block";
	window.document.getElementById(sParam !== "list" ? "list" : "cards").style.setProperty("display", "none", "important");
}
