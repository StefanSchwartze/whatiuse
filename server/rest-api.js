import Page from "./models/page";
import Stat from "./models/stat";
import Project from "./models/project";
import Snapshot from "./models/snapshot";
import generateApi from "koa-mongo-rest";

export default function(app) {

	const ProjectController = generateApi(app, Project, "/api");
	ProjectController.mount();

	const PagesController = generateApi(app, Page, "/api");
	PagesController.mount();

	const StatController = generateApi(app, Stat, "/api");
	StatController.mount();

	const SnapshotController = generateApi(app, Snapshot, "/api");
	SnapshotController.mount();

}