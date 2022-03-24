import Dictionary from './hylar/core/Dictionary';
import TripleStorageManager from './hylar/core/TripleStorageManager';
import Logics from './hylar/core/Logics/Logics';
import Rule from './hylar/core/Logics/Rule';
import Hylar from './hylar/hylar';

// import Utils from './hylar/core/Utils';
// import Dictionary from './hylar/core/Dictionary';
// import TripleStorageManager from './hylar/core/TripleStorageManager';
// import Logics from './hylar/core/Logics/Logics';
// import Rule from './hylar/core/Logics/Rule';

// T(?c,intersectionOf,?x1),T(?x1,first,?c1),T(?x1,rest,?x2),T(?x2,first,?c2),T(?y,type,?c1),T(?y,type,?c2)→T(?y,type,?c)
// T(?l,first,?m)→?T(?l,hasMember,?m)
// T(?l1,rest,?l2),T(?l2,hasMember,?m)→T(?l1,hasMember,?m)
// T(?c,owl:unionOf,?x),LIST[?x,?c1,...,?cn]→T(?c1,rdfs:subClassOf,?c),...,T(?cn,rdfs:subClassOf,?c)
// T(?c, owl:unionOf, ?x) LIST[?x, ?c1, ..., ?cn] T(?y, rdf:type, ?ci) → T(?y, rdf:type, ?c)
const additionalRules = (() => {
	const rules = Logics.parseRules(
		[
			// `ls-mbr1 = (?l http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?m) -> (?l http://rdf.equinor.com/ui/adhoc#hasMember ?m)`,
			// `ls-mbr2 = (?l2 http://rdf.equinor.com/ui/adhoc#hasMember ?m) ^ (?l1 http://www.w3.org/1999/02/22-rdf-syntax-ns#rest ?l2) -> (?l1 http://rdf.equinor.com/ui/adhoc#hasMember ?m)`,
			// `scm-uni = (?c http://www.w3.org/2002/07/owl#unionOf ?x) ^ (?x http://rdf.equinor.com/ui/adhoc#hasMember ?scmunimem) -> (?scmunimem http://www.w3.org/2002/07/owl#subClassOf ?c)`,
			// `cls-uni = (?x http://rdf.equinor.com/ui/adhoc#hasMember ?clsunimem) ^ (?c http://www.w3.org/2002/07/owl#unionOf ?x) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?clsunimem) -> (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c)`,

			// `cls-int1 = (?c http://www.w3.org/2002/07/owl#intersectionOf ?x1) ^ (?x1 http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?c1) ^ (?x1 http://www.w3.org/1999/02/22-rdf-syntax-ns#rest ?x2) ^ (?x2 http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?c2) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2) -> (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c)`,

			// `cls-int2 = (?c http://www.w3.org/2002/07/owl#intersectionOf ?x) ^ (?x http://rdf.equinor.com/ui/adhoc#hasMember ?cn) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c) -> (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?cn)`,

			// `scm-int = (?c http://www.w3.org/2002/07/owl#intersectionOf ?x) ^ (?x http://rdf.equinor.com/ui/adhoc#hasMember ?cn) -> (?cn http://www.w3.org/2002/07/owl#subClassOf ?c)`,

			`cls-nv = (?x http://rdf.equinor.com/ontology/owl2ext#notValue ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u ?p ?nv) ^ (?nv != ?y) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)`,
			`cls-prpdiff = (?x http://rdf.equinor.com/ontology/owl2ext#multipleValuesOnProperty ?p) ^ (?u ?p ?v1) ^ (?u ?p ?v2) ^ (?v1 != ?v2) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)`,
			// `scm-nv = (?c1 http://rdf.equinor.com/ui/adhoc#notValue ?i) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p1) ^ (?c2 http://rdf.equinor.com/ui/adhoc#notValue ?i) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p2) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)`
		],
		Rule.types.OWL2RL
	);
	// const ruleDict = Object.assign({}, ...rules.map((x:any) => ({[x.name]: x })));
	// ruleDict['ls-mbr1 '].addDependentRule(ruleDict['ls-mbr2 ']);
	// ruleDict['ls-mbr1 '].addDependentRule(ruleDict['scm-uni ']);
	// ruleDict['ls-mbr1 '].addDependentRule(ruleDict['cls-uni ']);
	// ruleDict['ls-mbr2 '].addDependentRule(ruleDict['cls-uni ']);
	// ruleDict['ls-mbr2 '].addDependentRule(ruleDict['scm-uni ']);
	return rules;
})();

export default class HylarWS extends Hylar {
	constructor(params = { entailment: Rule.types.OWL2RL }) {
		super(params);
		// this.setTagBased();
	}
	async clean() {
		this.dict = new Dictionary();
		this.sm = new TripleStorageManager(this.prefixes);
		await this.sm.init();
		this.persist();
	}

	async setOwl2RL() {
		await this.addRules([/*...Rules.owl2rl,*/ ...additionalRules]);
	}

	async parseAndAddRules(rawRules, entailment = this.entailment) {
		try {
			const rules = Logics.parseRules(rawRules, entailment, this.prefixes);
			await this.addRules(rules);
		} catch (e) {
			Hylar.displayError(e);
			return;
		}
	}
}
