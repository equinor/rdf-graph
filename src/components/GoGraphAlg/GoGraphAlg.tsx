import {
	GraphLinksModel,
	GraphObject,
	TextBlock,
	Binding,
	Diagram,
	LayeredDigraphLayout,
	TreeModel,
	Shape,
	Point,
	Panel,
	Spot,
	Node,
	Size,
	Link,
	TreeLayout,
} from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { useRef, useState } from 'react';

// const rr = [
// 	{ key: 2, parent: 0, name: "George VI", gender: "M", birthYear: "1895", deathYear: "1952", reign: "1936-1952", shape: 'Rectangle' },
// 	{ key: 7, parent: 2, name: "Elizabeth", gender: "F", birthYear: "1926", reign: "1952-", type: "wide", shape: 'Rectangle' },
// 	{ key: 16, parent: 7, name: "Charles, Prince of Wales", gender: "M", birthYear: "1948", shape: 'Ellipse' },
// 	{ key: 38, parent: 16, name: "Prince William", gender: "M", birthYear: "1982", shape: 'Rectangle' },
// 	{ key: 39, parent: 16, name: "Prince Harry of Wales", gender: "M", birthYear: "1984", shape: 'Rectangle' },
// 	{ key: 17, parent: 7, name: "Anne, Princess Royal", gender: "F", birthYear: "1950", shape: 'Rectangle' },
// 	{ key: 40, parent: 17, name: "Peter Phillips", gender: "M", birthYear: "1977", shape: 'Rectangle' },
// 	{ key: 82, parent: 40, name: "Savannah Phillips", gender: "F", birthYear: "2010", shape: 'Rectangle' },
// 	// { key: 41, parent: 17, name: "Zara Phillips", gender: "F", birthYear: "1981", shape: 'Rectangle' },
// 	{ key: 18, parent: 7, name: "Prince Andrew", gender: "M", birthYear: "1960", shape: 'Rectangle' },
// 	{ key: 42, parent: 18, name: "Princess Beatrice of York", gender: "F", birthYear: "1988", shape: 'Rectangle' },
// 	{ key: 43, parent: 18, name: "Princess Eugenie of York", gender: "F", birthYear: "1990", shape: 'Rectangle' },
// 	{ key: 19, parent: 7, name: "Prince Edward", gender: "M", birthYear: "1964", shape: 'Rectangle' },
// 	{ key: 44, parent: 19, name: "Lady Louise Windsor", gender: "F", birthYear: "2003", shape: 'Rectangle' },
// 	{ key: 45, parent: 19, name: "James, Viscount Severn", gender: "M", birthYear: "2007", shape: 'Rectangle' },
// 	{ key: 8, parent: 2, name: "Princess Margaret", gender: "F", birthYear: "1930", deathYear: "2002", shape: 'Rectangle' },
// 	{ key: 20, parent: 8, name: "David Armstrong-Jones", gender: "M", birthYear: "1961", shape: 'Rectangle' },
// 	{ key: 21, parent: 8, name: "Lady Sarah Chatto", gender: "F", birthYear: "1964", shape: 'Rectangle' },
// 	{ key: 46, parent: 21, name: "Samuel Chatto", gender: "M", birthYear: "1996", shape: 'Rectangle' },
// 	{ key: 47, parent: 21, name: "Arthur Chatto", gender: "M", birthYear: "1999", shape: 'Rectangle' },
// 	{ key: 100, parent: 82, name: "Zara 1", gender: "F", birthYear: "1981", shape: 'Rectangle' },
// 	{ key: 101, parent: 42, name: "Zara 2", gender: "F", birthYear: "1981", shape: 'Rectangle' },
// ];

const rr = [
	{ name: '0000101OR907', key: 'https://rdf.equinor.com/drafts/aml/29EF7361-7233-7995-3EC1-42A334371B28', shape: 'Ellipse' },
	{
		name: 'A-DummyTag0016, Power cut (QDV/hydraulic LP dump) closing all XT-valves (not SCSSVs) on all Subsea templates',
		key: 'https://rdf.equinor.com/drafts/aml/343D0F28-DBE9-53AD-97E2-78A6F2F00781',
		shape: 'Rectangle',
	},
	{ name: '0000101OR903', key: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131', shape: 'Ellipse' },
	{ name: 'A-ESD2-0, ESD2', key: 'https://rdf.equinor.com/drafts/aml/BE7354B4-A331-2DE0-AAB3-99896F008878', shape: 'Rectangle' },
	{
		name: 'Loss of comm. with of OOC preceded by F&G alarm or KO Drum LAHH (ESD signal)',
		key: 'https://rdf.equinor.com/drafts/aml/162F3FCD-50D1-A28C-A3F0-5F386F85025D',
		shape: 'Ellipse',
	},
	{ name: '0000101OR901', key: 'https://rdf.equinor.com/drafts/aml/241B8018-89C2-39CE-E113-E689785A45AC', shape: 'Ellipse' },
	{ name: '0000101OR905', key: 'https://rdf.equinor.com/drafts/aml/810B57B6-EE17-2322-6D87-DFD5A97E3C9C', shape: 'Ellipse' },
	{
		name: 'A-DummyTag0001, Shutdown of SCE (F&G, PAGA, ESD/EDP, PSD, PCS, UPS and comm)',
		key: 'https://rdf.equinor.com/drafts/aml/03D6002C-5526-B0F5-714D-755501685752',
		shape: 'Rectangle',
	},
	{ name: '0000101Split037', key: 'https://rdf.equinor.com/drafts/aml/6EB3B54A-EC55-5BA2-BE06-2C3F83A9E4EF', shape: 'Ellipse' },
	{
		name: 'Close topside ESVs (incl. Riser ESVs), 0000101Split038',
		key: 'https://rdf.equinor.com/drafts/aml/BA7F6D09-002D-69F5-2A52-F91C620C5FAC',
		shape: 'Ellipse',
	},
	{ name: 'A-PSD, PSD', key: 'https://rdf.equinor.com/drafts/aml/A6678B51-5F1E-4A63-CBBF-85B9418E3CDC', shape: 'Rectangle' },
	{
		name: 'Confirmed Fire or Gas in area with SCE (incl UPS)',
		key: 'https://rdf.equinor.com/drafts/aml/5A813597-EC4A-97E4-4462-7D17C872BE4E',
		shape: 'Ellipse',
	},
	{ name: '0000101Split035', key: 'https://rdf.equinor.com/drafts/aml/C5D36904-BC0D-E817-7578-6FB58A72DAAD', shape: 'Ellipse' },
	{
		name: 'ESDx at down-stream/receiving HC-flow-connected facility',
		key: 'https://rdf.equinor.com/drafts/aml/3404F8CD-5E1C-41E5-AB13-3863B50A84FC',
		shape: 'Ellipse',
	},
	{ name: 'KO Drum LAHH (ESD signal)', key: 'https://rdf.equinor.com/drafts/aml/1C5C889E-EC7E-FCFC-8D0C-BC58BE1AE520', shape: 'Ellipse' },
	{ name: '0000101Split032', key: 'https://rdf.equinor.com/drafts/aml/BDE227FC-B55F-BFD2-02BA-B12BB87D9990', shape: 'Ellipse' },
	{
		name: 'A-DummyTag0006, Close all SCSSVs (activation + topside HP bleed)',
		key: 'https://rdf.equinor.com/drafts/aml/7519A580-279F-47BE-1C6A-7BF8AF07731C',
		shape: 'Rectangle',
	},
	{ name: 'A-ESD0, ESD0', key: 'https://rdf.equinor.com/drafts/aml/C6E8CF52-A302-898D-4F3E-4997D8E3A2D0', shape: 'Rectangle' },
	{ name: '0000101Split902', key: 'https://rdf.equinor.com/drafts/aml/109B5877-6814-93A6-81B2-6A1C658ABEE4', shape: 'Ellipse' },
	{
		name: 'Loss of both main and essential power',
		key: 'https://rdf.equinor.com/drafts/aml/A8FB8948-1473-561B-F759-F287E6B07679',
		shape: 'Ellipse',
	},
	{ name: '0000101TimerR026', key: 'https://rdf.equinor.com/drafts/aml/B152D346-80E1-6A2E-65C5-52DA38FC22C2', shape: 'Rectangle' },
	{ name: '0000101OR906', key: 'https://rdf.equinor.com/drafts/aml/70FD898F-632D-F816-DA00-D5A723EE76AA', shape: 'Ellipse' },
	{
		name: 'A-DummyTag0003, Close damper and stop fan',
		key: 'https://rdf.equinor.com/drafts/aml/D34B4682-151A-EBAE-AD8F-79D1347AE01E',
		shape: 'Rectangle',
	},
	{ name: 'Confirmed Fire in Haz Area', key: 'https://rdf.equinor.com/drafts/aml/BFFF5B39-79B9-65C1-AC52-DD415818F2BD', shape: 'Ellipse' },
	{ name: '0000101Split034', key: 'https://rdf.equinor.com/drafts/aml/9487182A-B6BF-D245-0E8A-B04DDECB96B3', shape: 'Ellipse' },
	{
		name: 'A-DummyTag0011, Trip crane in operation',
		key: 'https://rdf.equinor.com/drafts/aml/7901DF74-B39F-F88A-F174-7D3661A253E7',
		shape: 'Rectangle',
	},
	{
		name: 'A-DummyTag0004, Auto disconnection of Non-Ex SCE + manual disconnection of EX SCE',
		key: 'https://rdf.equinor.com/drafts/aml/A265330C-B649-C8A6-F6EF-8A4012D3E260',
		shape: 'Rectangle',
	},
	{ name: '0000101TimerR029', key: 'https://rdf.equinor.com/drafts/aml/384B6FDA-04C2-0159-A573-C3A0DFEEC00E', shape: 'Rectangle' },
	{
		name: 'A-DummyTag0002, Disconnect Essential power sources',
		key: 'https://rdf.equinor.com/drafts/aml/72DDE41D-5FB8-FA26-B722-A0473A1ACD19',
		shape: 'Rectangle',
	},
	{
		name: 'A-DummyTag0005, Topside LP bleed closing all Subsea XT-valves',
		key: 'https://rdf.equinor.com/drafts/aml/A1E19BA3-3FAF-CB67-0943-D988127716B9',
		shape: 'Rectangle',
	},
	{ name: '0000101TimerR024', key: 'https://rdf.equinor.com/drafts/aml/A06E9FE3-38CD-D117-6127-F068F4D4E77C', shape: 'Rectangle' },
	{ name: '0000101Split904', key: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669', shape: 'Ellipse' },
	{
		name: 'A-DummyTag0014, ISC: All Essential equipment in naturally ventilated areas',
		key: 'https://rdf.equinor.com/drafts/aml/21C7C1B4-0564-8B0C-5DBE-6DB7E154F90D',
		shape: 'Rectangle',
	},
	{ name: 'A-DummyTag0008, PSD on PdQ', key: 'https://rdf.equinor.com/drafts/aml/0EBE3107-78DA-4B59-D198-D826CF36BD90', shape: 'Rectangle' },
	{
		name: 'A-DummyTag0007, Stop import (i.e stop Export at connected facilities using at least PCS)',
		key: 'https://rdf.equinor.com/drafts/aml/850FD8B1-BECC-A917-05E6-5801D4F72765',
		shape: 'Rectangle',
	},
	{
		name: 'A-DummyTag0017, Sequencial closure of all Subsea Wells (not SCSSVs)',
		key: 'https://rdf.equinor.com/drafts/aml/334FF36A-3307-E0FA-990D-E6B02EB64562',
		shape: 'Rectangle',
	},
	{
		name: 'A-DummyTag0010, ISC: All non-Essential Equipment in naturally ventilated areas',
		key: 'https://rdf.equinor.com/drafts/aml/B8163E91-C1E5-5535-859A-473E355D5ABE',
		shape: 'Rectangle',
	},
	{
		name: 'A-DummyTag0013, NonEss+Ess, in MechVent (NonEx+Ex), not EssPower',
		key: 'https://rdf.equinor.com/drafts/aml/3D2DB1D0-1C16-FC99-16CF-B35CDF505367',
		shape: 'Rectangle',
	},
	{ name: '0000101TimerR028', key: 'https://rdf.equinor.com/drafts/aml/19E367C2-4FD4-4812-DD9C-DAB795F04688', shape: 'Rectangle' },
	{
		name: 'A-DummyTag0015, Alarm/signal to SOV or Flotel',
		key: 'https://rdf.equinor.com/drafts/aml/B846C518-F208-32BF-1D63-0E14796F870B',
		shape: 'Rectangle',
	},
	{
		name: 'Confirmed fire or gas in area with non-Ex SAS cabinets',
		key: 'https://rdf.equinor.com/drafts/aml/CEF06BBF-7B84-ABE6-072E-EFFC01897536',
		shape: 'Ellipse',
	},
	{ name: '0000101OR030', key: 'https://rdf.equinor.com/drafts/aml/0E8BD296-F432-926A-82B2-7C06848730F2', shape: 'Ellipse' },
	{ name: 'Instant A-ESD0 P/B in OOC', key: 'https://rdf.equinor.com/drafts/aml/E9532119-BB1D-C028-4864-39EFA60E2844', shape: 'Ellipse' },
	{
		name: 'Confirmed Fire or     Gas in essential power supply enclosure',
		key: 'https://rdf.equinor.com/drafts/aml/2DC77114-EDF3-A00A-7214-878DC0E4A6AA',
		shape: 'Ellipse',
	},
	{ name: '0000101Split033', key: 'https://rdf.equinor.com/drafts/aml/06BCFB06-8D5C-746D-5324-60839A060CAE', shape: 'Ellipse' },
	{ name: '0000101Split036', key: 'https://rdf.equinor.com/drafts/aml/B04F2D5A-ADC2-2AC0-5D8B-F89776F65E59', shape: 'Ellipse' },
	{ name: 'Loss of communication with OOC', key: 'https://rdf.equinor.com/drafts/aml/B40160CD-818A-43DA-7941-15802E5F6861', shape: 'Ellipse' },
	{ name: '0000101TimerR027', key: 'https://rdf.equinor.com/drafts/aml/6248A35E-BF41-47CF-0C6A-06F380A1D967', shape: 'Rectangle' },
	{ name: 'Single Low Gas in HVAC inlet', key: 'https://rdf.equinor.com/drafts/aml/FEF08DCE-0B84-6FB5-89DB-B0FD3AA1F549', shape: 'Ellipse' },
	{ name: 'Confirmed Gas in Haz. Area', key: 'https://rdf.equinor.com/drafts/aml/436456FF-1FCF-62FF-F94A-6479846D4A64', shape: 'Ellipse' },
	{
		name: 'Confirmed Gas in Non-Haz. Area (Nat. vent/Mech. vent areas)',
		key: 'https://rdf.equinor.com/drafts/aml/0F8F55BA-2FE9-AE22-9FC7-2822CE016E8C',
		shape: 'Ellipse',
	},
	{
		name: 'Confirmed Fire  or Gas in HVAC inlet',
		key: 'https://rdf.equinor.com/drafts/aml/50ECDB67-0F3E-7FD0-5A6C-4B99E7F2DC6E',
		shape: 'Ellipse',
	},
	{ name: 'ESD0 P/B in OOC', key: 'https://rdf.equinor.com/drafts/aml/2EF91C5B-69A4-906E-5D00-FC83E86D60DB', shape: 'Ellipse' },
	{ name: 'ESD2 P/B in OOC', key: 'https://rdf.equinor.com/drafts/aml/5AA4FACB-6F00-B05A-FBD8-EFFB5DA4ED93', shape: 'Ellipse' },
	{ name: '0000101Split031', key: 'https://rdf.equinor.com/drafts/aml/0DE4D7E8-DA6A-37B8-060C-D244214482CC', shape: 'Ellipse' },
	{ name: 'ESD2 P/B in the field', key: 'https://rdf.equinor.com/drafts/aml/DC375C9E-6965-F7E5-79BE-636C2D57BC99', shape: 'Ellipse' },
	{
		name: 'Confirmed Fire in Non-Haz. Area (Nat. vent/Mech. vent areas)',
		key: 'https://rdf.equinor.com/drafts/aml/2F5E7F13-173B-CF8C-8631-5C6777893A1E',
		shape: 'Ellipse',
	},
	{ name: 'Single low gas anywhere', key: 'https://rdf.equinor.com/drafts/aml/45178A9C-C509-C277-1888-417752397A71', shape: 'Ellipse' },
];

const tt = [
	{
		from: 'https://rdf.equinor.com/drafts/aml/29EF7361-7233-7995-3EC1-42A334371B28',
		to: 'https://rdf.equinor.com/drafts/aml/343D0F28-DBE9-53AD-97E2-78A6F2F00781',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/109B5877-6814-93A6-81B2-6A1C658ABEE4',
		to: 'https://rdf.equinor.com/drafts/aml/29EF7361-7233-7995-3EC1-42A334371B28',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/19E367C2-4FD4-4812-DD9C-DAB795F04688',
		to: 'https://rdf.equinor.com/drafts/aml/29EF7361-7233-7995-3EC1-42A334371B28',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
		to: 'https://rdf.equinor.com/drafts/aml/BE7354B4-A331-2DE0-AAB3-99896F008878',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/1C5C889E-EC7E-FCFC-8D0C-BC58BE1AE520',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/BFFF5B39-79B9-65C1-AC52-DD415818F2BD',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/9487182A-B6BF-D245-0E8A-B04DDECB96B3',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/C5D36904-BC0D-E817-7578-6FB58A72DAAD',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/436456FF-1FCF-62FF-F94A-6479846D4A64',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/06BCFB06-8D5C-746D-5324-60839A060CAE',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/0F8F55BA-2FE9-AE22-9FC7-2822CE016E8C',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/6248A35E-BF41-47CF-0C6A-06F380A1D967',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/5AA4FACB-6F00-B05A-FBD8-EFFB5DA4ED93',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/DC375C9E-6965-F7E5-79BE-636C2D57BC99',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/2F5E7F13-173B-CF8C-8631-5C6777893A1E',
		to: 'https://rdf.equinor.com/drafts/aml/DDAE9E23-A55A-2FFD-818D-3941B8566131',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/109B5877-6814-93A6-81B2-6A1C658ABEE4',
		to: 'https://rdf.equinor.com/drafts/aml/BE7354B4-A331-2DE0-AAB3-99896F008878',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/BE7354B4-A331-2DE0-AAB3-99896F008878',
		to: 'https://rdf.equinor.com/drafts/aml/BA7F6D09-002D-69F5-2A52-F91C620C5FAC',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/BE7354B4-A331-2DE0-AAB3-99896F008878',
		to: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/162F3FCD-50D1-A28C-A3F0-5F386F85025D',
		to: 'https://rdf.equinor.com/drafts/aml/241B8018-89C2-39CE-E113-E689785A45AC',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/241B8018-89C2-39CE-E113-E689785A45AC',
		to: 'https://rdf.equinor.com/drafts/aml/C6E8CF52-A302-898D-4F3E-4997D8E3A2D0',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/2EF91C5B-69A4-906E-5D00-FC83E86D60DB',
		to: 'https://rdf.equinor.com/drafts/aml/241B8018-89C2-39CE-E113-E689785A45AC',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/0DE4D7E8-DA6A-37B8-060C-D244214482CC',
		to: 'https://rdf.equinor.com/drafts/aml/241B8018-89C2-39CE-E113-E689785A45AC',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/810B57B6-EE17-2322-6D87-DFD5A97E3C9C',
		to: 'https://rdf.equinor.com/drafts/aml/03D6002C-5526-B0F5-714D-755501685752',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/BDE227FC-B55F-BFD2-02BA-B12BB87D9990',
		to: 'https://rdf.equinor.com/drafts/aml/810B57B6-EE17-2322-6D87-DFD5A97E3C9C',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/ECBFC6A9-D1DA-F17C-FA8E-AF313B8AA456',
		to: 'https://rdf.equinor.com/drafts/aml/810B57B6-EE17-2322-6D87-DFD5A97E3C9C',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/A06E9FE3-38CD-D117-6127-F068F4D4E77C',
		to: 'https://rdf.equinor.com/drafts/aml/810B57B6-EE17-2322-6D87-DFD5A97E3C9C',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/6EB3B54A-EC55-5BA2-BE06-2C3F83A9E4EF',
		to: 'https://rdf.equinor.com/drafts/aml/BA7F6D09-002D-69F5-2A52-F91C620C5FAC',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/6EB3B54A-EC55-5BA2-BE06-2C3F83A9E4EF',
		to: 'https://rdf.equinor.com/drafts/aml/A6678B51-5F1E-4A63-CBBF-85B9418E3CDC',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/3404F8CD-5E1C-41E5-AB13-3863B50A84FC',
		to: 'https://rdf.equinor.com/drafts/aml/6EB3B54A-EC55-5BA2-BE06-2C3F83A9E4EF',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/A6678B51-5F1E-4A63-CBBF-85B9418E3CDC',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/5A813597-EC4A-97E4-4462-7D17C872BE4E',
		to: 'https://rdf.equinor.com/drafts/aml/C5D36904-BC0D-E817-7578-6FB58A72DAAD',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/C5D36904-BC0D-E817-7578-6FB58A72DAAD',
		to: 'https://rdf.equinor.com/drafts/aml/A265330C-B649-C8A6-F6EF-8A4012D3E260',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/BDE227FC-B55F-BFD2-02BA-B12BB87D9990',
		to: 'https://rdf.equinor.com/drafts/aml/7519A580-279F-47BE-1C6A-7BF8AF07731C',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/0DE4D7E8-DA6A-37B8-060C-D244214482CC',
		to: 'https://rdf.equinor.com/drafts/aml/BDE227FC-B55F-BFD2-02BA-B12BB87D9990',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/A06E9FE3-38CD-D117-6127-F068F4D4E77C',
		to: 'https://rdf.equinor.com/drafts/aml/7519A580-279F-47BE-1C6A-7BF8AF07731C',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/C6E8CF52-A302-898D-4F3E-4997D8E3A2D0',
		to: 'https://rdf.equinor.com/drafts/aml/109B5877-6814-93A6-81B2-6A1C658ABEE4',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/109B5877-6814-93A6-81B2-6A1C658ABEE4',
		to: 'https://rdf.equinor.com/drafts/aml/72DDE41D-5FB8-FA26-B722-A0473A1ACD19',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/109B5877-6814-93A6-81B2-6A1C658ABEE4',
		to: 'https://rdf.equinor.com/drafts/aml/9487182A-B6BF-D245-0E8A-B04DDECB96B3',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/109B5877-6814-93A6-81B2-6A1C658ABEE4',
		to: 'https://rdf.equinor.com/drafts/aml/A1E19BA3-3FAF-CB67-0943-D988127716B9',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/109B5877-6814-93A6-81B2-6A1C658ABEE4',
		to: 'https://rdf.equinor.com/drafts/aml/A06E9FE3-38CD-D117-6127-F068F4D4E77C',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/A8FB8948-1473-561B-F759-F287E6B07679',
		to: 'https://rdf.equinor.com/drafts/aml/B152D346-80E1-6A2E-65C5-52DA38FC22C2',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/70FD898F-632D-F816-DA00-D5A723EE76AA',
		to: 'https://rdf.equinor.com/drafts/aml/D34B4682-151A-EBAE-AD8F-79D1347AE01E',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/9487182A-B6BF-D245-0E8A-B04DDECB96B3',
		to: 'https://rdf.equinor.com/drafts/aml/70FD898F-632D-F816-DA00-D5A723EE76AA',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/FEF08DCE-0B84-6FB5-89DB-B0FD3AA1F549',
		to: 'https://rdf.equinor.com/drafts/aml/70FD898F-632D-F816-DA00-D5A723EE76AA',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/9487182A-B6BF-D245-0E8A-B04DDECB96B3',
		to: 'https://rdf.equinor.com/drafts/aml/D34B4682-151A-EBAE-AD8F-79D1347AE01E',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/9487182A-B6BF-D245-0E8A-B04DDECB96B3',
		to: 'https://rdf.equinor.com/drafts/aml/7901DF74-B39F-F88A-F174-7D3661A253E7',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/50ECDB67-0F3E-7FD0-5A6C-4B99E7F2DC6E',
		to: 'https://rdf.equinor.com/drafts/aml/9487182A-B6BF-D245-0E8A-B04DDECB96B3',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/384B6FDA-04C2-0159-A573-C3A0DFEEC00E',
		to: 'https://rdf.equinor.com/drafts/aml/7901DF74-B39F-F88A-F174-7D3661A253E7',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/B04F2D5A-ADC2-2AC0-5D8B-F89776F65E59',
		to: 'https://rdf.equinor.com/drafts/aml/384B6FDA-04C2-0159-A573-C3A0DFEEC00E',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/06BCFB06-8D5C-746D-5324-60839A060CAE',
		to: 'https://rdf.equinor.com/drafts/aml/72DDE41D-5FB8-FA26-B722-A0473A1ACD19',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/0DE4D7E8-DA6A-37B8-060C-D244214482CC',
		to: 'https://rdf.equinor.com/drafts/aml/A06E9FE3-38CD-D117-6127-F068F4D4E77C',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/21C7C1B4-0564-8B0C-5DBE-6DB7E154F90D',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/0EBE3107-78DA-4B59-D198-D826CF36BD90',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/850FD8B1-BECC-A917-05E6-5801D4F72765',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/334FF36A-3307-E0FA-990D-E6B02EB64562',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/B8163E91-C1E5-5535-859A-473E355D5ABE',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/3D2DB1D0-1C16-FC99-16CF-B35CDF505367',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/19E367C2-4FD4-4812-DD9C-DAB795F04688',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/8D158492-BF7E-286A-90D0-335A5B5FD669',
		to: 'https://rdf.equinor.com/drafts/aml/B846C518-F208-32BF-1D63-0E14796F870B',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/B04F2D5A-ADC2-2AC0-5D8B-F89776F65E59',
		to: 'https://rdf.equinor.com/drafts/aml/B8163E91-C1E5-5535-859A-473E355D5ABE',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/CEF06BBF-7B84-ABE6-072E-EFFC01897536',
		to: 'https://rdf.equinor.com/drafts/aml/0E8BD296-F432-926A-82B2-7C06848730F2',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/E9532119-BB1D-C028-4864-39EFA60E2844',
		to: 'https://rdf.equinor.com/drafts/aml/0E8BD296-F432-926A-82B2-7C06848730F2',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/0E8BD296-F432-926A-82B2-7C06848730F2',
		to: 'https://rdf.equinor.com/drafts/aml/0DE4D7E8-DA6A-37B8-060C-D244214482CC',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/2DC77114-EDF3-A00A-7214-878DC0E4A6AA',
		to: 'https://rdf.equinor.com/drafts/aml/06BCFB06-8D5C-746D-5324-60839A060CAE',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/45178A9C-C509-C277-1888-417752397A71',
		to: 'https://rdf.equinor.com/drafts/aml/B04F2D5A-ADC2-2AC0-5D8B-F89776F65E59',
	},
	{
		from: 'https://rdf.equinor.com/drafts/aml/B40160CD-818A-43DA-7941-15802E5F6861',
		to: 'https://rdf.equinor.com/drafts/aml/6248A35E-BF41-47CF-0C6A-06F380A1D967',
	},
];

// let diagram = {};

export const GoGraphAlg = () => {
	const [isDarkMode, setDarkMode] = useState(false);
	// const [dg, setDg] = useState<go.Diagram>();

	const initDiagram = (isDarkMode: boolean) => {
		const $ = GraphObject.make;
		// set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
		// console.log(18, 'isDarkMode =>', isDarkMode, Object.keys(diagram).length)
		// if (Object.keys(diagram).length) {
		// 	diagram.startTransaction('refresh')
		// 	diagram.commitTransaction('refresh')
		// 	console.log(19, 'reset', diagram)
		// }
		// diagram.div = null;
		// diagram = null;
		const diagram = $(Diagram, {
			// "toolManager.hoverDelay": 100,
			// allowCopy: false,
			// layout:  $(TreeLayout, {
			// 	angle: 90,
			// 	nodeSpacing: 10,
			// 	layerSpacing: 40,
			// 	layerStyle: TreeLayout.LayerUniform,
			// }),
			model: new GraphLinksModel({
				linkKeyProperty: 'key', // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
				// linkFromPortIdProperty: 'fromPort',
				// linkToPortIdProperty: 'toPort',
				// linkDataArray: tt
			}),
			layout: $(LayeredDigraphLayout, {
				layerSpacing: 40,
				direction: 90,
				layeringOption: LayeredDigraphLayout.LayerLongestPathSink,
			}),
		});

		const bluegrad = '#90CAF9';
		const pinkgrad = '#F48FB1';

		// get tooltip text from the object's data
		const tooltipTextConverter = (person: any) => {
			let str = '';
			str += 'Born: ' + person.birthYear;
			if (person.deathYear !== undefined) str += '\nDied: ' + person.deathYear;
			if (person.reign !== undefined) str += '\nReign: ' + person.reign;
			return str;
		};

		// define Converters to be used for Bindings
		const genderBrushConverter = (gender: any) => {
			if (isDarkMode) return '#fff';
			if (gender === 'M') return bluegrad;
			if (gender === 'F') return pinkgrad;
			return 'orange';
		};

		const setWhiteColor = () => '#fff';

		// define Converters to be used for Bindings
		const getWidth = (type: any) => {
			if (type === 'wide') return 400;
			return 100;
		};

		// define tooltips for nodes
		const tooltiptemplate = $(
			'ToolTip',
			{ 'Border.fill': 'whitesmoke', 'Border.stroke': 'black' },
			$(
				TextBlock,
				{
					font: 'bold 8pt Helvetica, bold Arial, sans-serif',
					wrap: TextBlock.WrapFit,
					margin: 5,
				},
				new Binding('text', '', tooltipTextConverter)
			)
		);

		// define a simple Node template
		diagram.nodeTemplate = $(
			Node,
			'Auto',
			{ deletable: false, toolTip: tooltiptemplate },
			new Binding('text', 'name'),
			$(
				Shape,
				{
					fill: 'lightgray',
					stroke: null,
					strokeWidth: 0,
					stretch: GraphObject.Fill,
					alignment: Spot.Center,
				},
				new Binding('figure', 'shape'),
				new Binding('fill', 'gender', genderBrushConverter)
			),
			$(
				TextBlock,
				{
					font: '700 12px Droid Serif, sans-serif',
					textAlign: 'center',
					margin: 10,
					// height: 400,
					maxSize: new Size(190, NaN),
				},
				new Binding('width', 'type', getWidth),
				new Binding('text', 'name')
			)
		);

		diagram.linkTemplate = $(
			Link, // defined below
			{
				routing: Link.Orthogonal,
				corner: 5,
				selectable: false,
			},

			$(Shape, {
				strokeWidth: 3,
				stroke: isDarkMode ? '#fff' : '#424242',
			})
		);

		// HERE: WHEN PARENT
		// diagram.model = new TreeModel(rr)

		// diagram.startTransaction('refresh')
		// diagram.commitTransaction('refresh')
		// console.log(1234, diagram)
		// diagram.updateAllRelationshipsFromData();
		// diagram.updateAllTargetBindings();
		// diagram.requestUpdate()

		return diagram;
	};

	const diagramRef = useRef<Diagram>(initDiagram(isDarkMode));
	// useState(() => setDg(initDiagram(isDarkMode)));

	const handleModelChange = () => {
		setDarkMode(!isDarkMode);

		// initDiagram(!isDarkMode);
		// diagramRef.current.reset()
		// diagramRef.current.redraw()
		console.log(772);
		// initDiagram(isDarkMode).reset()
		// initDiagram(isDarkMode).updateAllRelationshipsFromData();
		// initDiagram(isDarkMode).updateAllTargetBindings();
		// initDiagram(isDarkMode).requestUpdate()
	};

	const HMC = () => {
		console.log(771);
	};

	return (
		<>
			<button style={{ fontSize: '18px', border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleModelChange()}>
				{isDarkMode ? '☀️' : '🌙'}
			</button>
			<br />
			<br />
			<ReactDiagram
				style={{ height: '1000px', width: '1000px', background: isDarkMode ? '#424242' : '#fff' }}
				initDiagram={() => diagramRef.current}
				// divClassName="tree-model"
				divClassName="graph-links-model"
				nodeDataArray={rr}
				linkDataArray={tt}
				// skipsDiagramUpdate={true}
				// onDiagramChange={() => handleModelChange()}
				onModelChange={() => HMC()}
			/>
		</>
	);
};
