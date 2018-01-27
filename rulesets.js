'use strict';

exports.BattleFormats = {
	pokemon:{
	effectType: 'ValidatorRule',
	name: 'Pokemon',
	onValidateTeam: function (team, format) {
			let nameTable = {};
			for (let i = 0; i < team.length; i++) {
				let species = team[i].baseSpecies?team[i].baseSpecies:team[i].species;
				if(!(species in nameTable)) {nameTable[species] = 1;}
				else if(nameTable[species]<1){
					nameTable[species]++;
					}
				else {
					 return ["(You have more than one " + species + ")"];
					}
				if (!team[i].name) continue;
				let name = this.getTemplate(team[i].name.substring(1,20)).baseSpecies!=undefined ? ''+this.getTemplate(team[i].name.substring(1,20)).baseSpecies:team[i].name.substring(1,20);
				if(name!=species)
				{
					if (!(name in nameTable)) {
						nameTable[name] = 1;
					} else if (nameTable[name] < 1) {
						nameTable[name]++;
					} else {
						return ["You have more than one " + name];
					}
				}
			}
		},
		onValidateSet: function (set, format) {
			let doublesUbers =['Arceus', 'Dialga', 'Giratina', 'Giratina-Origin', 'Groudon', 'Ho-Oh', 'Jirachi', 'Kyogre', 'Kyurem-White',
			'Lugia', 'Lunala', 'Magearna', 'Mewtwo', 'Palkia', 'Rayquaza', 'Reshiram', 'Solgaleo', 'Xerneas', 'Yveltal', 'Zekrom'];
			let legalTiers = format.legaltiers;
			let lessRules = format.lr;
			let gameType = format.gameType;
		 	let item = this.getItem(set.item);
			let template = this.getTemplate(set.species);
			let problems = [];
			let totalEV = 0;
			let template1 = this.getTemplate(set.species);
			let name=set.species;
			let template2 = template1;
			if ((template.num === 25 || template.num === 172) && template.tier === 'Illegal') {
				problems.push(set.species + ' does not exist outside of gen ' + template.gen + '.');
			}
			if (set.moves && set.moves.length > 4) {
				problems.push((set.name || set.species) + ' has more than four moves.');
			}
			if (set.level && set.level > 100) {
				problems.push((set.name || set.species) + ' is higher than level 100.');
			}

			if (item.isNonstandard) {
				if (item.isNonstandard === 'gen2') {
					problems.push(item.name + ' does not exist outside of gen 2.');
				} 
			}

			for (let k in set.evs) {
				if (typeof set.evs[k] !== 'number' || set.evs[k] < 0) {
					set.evs[k] = 0;
				}
				totalEV += set.evs[k];
			}
			// In gen 6, it is impossible to battle other players with pokemon that break the EV limit
			if (totalEV > 510 && this.gen === 6) {
				problems.push((set.name || set.species) + " has more than 510 total EVs.");
			}

			// ----------- legality line ------------------------------------------
			// everything after this line only happens if we're doing legality enforcement

			// only in gen 1 and 2 it was legal to max out all EVs
			if (this.gen >= 3 && totalEV > 510) {
				problems.push((set.name || set.species) + " has more than 510 total EVs.");
			}

			if (template.gender) {
				if (set.gender !== template.gender) {
					set.gender = template.gender;
				}
			} else {
				if (set.gender !== 'M' && set.gender !== 'F') {
					set.gender = undefined;
				}
			}

			// limit one of each move
			let moves = [];
			if (set.moves) {
				let hasMove = {};
				for (let i = 0; i < set.moves.length; i++) {
					let move = this.getMove(set.moves[i]);
					let moveid = move.id;
					if (hasMove[moveid]) continue;
					hasMove[moveid] = true;
					moves.push(set.moves[i]);
				}
			}
			set.moves = moves;

			let battleForme = template.battleOnly && template.species;
			if (battleForme) {
				if (template.requiredAbility && set.ability !== template.requiredAbility) {
					problems.push("" + template.species + " transforms in-battle with " + template.requiredAbility + "."); // Darmanitan-Zen, Zygarde-Complete
				}
				if (template.requiredItems && !template.requiredItems.includes(item.name)) {
					problems.push("" + template.species + " transforms in-battle with " + Chat.plural(template.requiredItems.length, "either ") + template.requiredItems.join(" or ") + '.'); // Mega or Primal
				}
				if (template.requiredMove && set.moves.indexOf(toId(template.requiredMove)) < 0) {
					problems.push("" + template.species + " transforms in-battle with " + template.requiredMove + "."); // Meloetta-Pirouette, Rayquaza-Mega
				}
				set.species = template.baseSpecies; // Fix forme for Aegislash, Castform, etc.
			} else {
				if (template.requiredAbility && set.ability !== template.requiredAbility) {
					problems.push("" + (set.name || set.species) + " needs the ability " + template.requiredAbility + "."); // No cases currently.
				}
				if (template.requiredItems && !template.requiredItems.includes(item.name)) {
					problems.push("" + (set.name || set.species) + " needs to hold " + Chat.plural(template.requiredItems.length, "either ") + template.requiredItems.join(" or ") + '.'); // Memory/Drive/Griseous Orb/Plate/Z-Crystal - Forme mismatch
				}
				if (template.requiredMove && set.moves.indexOf(toId(template.requiredMove)) < 0) {
					problems.push("" + (set.name || set.species) + " needs to have the move " + template.requiredMove + "."); // Keldeo-Resolute
				}

			}

			if (template.species === 'Pikachu-Cosplay') {
				let cosplay = {meteormash:'Pikachu-Rock-Star', iciclecrash:'Pikachu-Belle', drainingkiss:'Pikachu-Pop-Star', electricterrain:'Pikachu-PhD', flyingpress:'Pikachu-Libre'};
				for (let i = 0; i < set.moves.length; i++) {
					if (set.moves[i] in cosplay) {
						set.species = cosplay[set.moves[i]];
						break;
					}
				}
			}

			if (set.species !== template.species) {
				// Autofixed forme.
				template = this.getTemplate(set.species);

			}
			global.TeamValidator = require('../../sim/team-validator');
			if(set.name != undefined|set.name != null)
				{
				name=set.name.substring(1,20);
				template2 = this.getTemplate(set.name.substring(1,20));
				}
			if(!template2.exists)
				{
				template2=template1;
				name=set.species;
				}
			let ability = this.getAbility(set.ability);
			let abilityAfterMega;
			if(this.getItem(set.item).megaEvolves==set.species)
			{
			abilityAfterMega = this.getAbility(this.getTemplate(this.getItem(set.item).megaStone).abilities[0]);
			}
			moves = set.moves;
			let StatsSum0=0;
			let StatsSum1=0;
			let abilityList=[];
			let originTemplate1=this.getTemplate(template1.baseSpecies);
			let originTemplate2=this.getTemplate(template2.baseSpecies);
			if(template1.isMega) abilityList=Object.values(template1.abilities).concat(Object.values(originTemplate1.abilities)); else abilityList=Object.values(template1.abilities);
			if(template1!=undefined&&template2!=undefined&&template1!=null&&template2!=null&&template1!=template2)
				{
				abilityList=abilityList.concat(Object.values(template2.abilities));
				if(template2.isMega) problems.push("Using Mega-Pokemons in fusion is banned");
					if ((!abilityList.includes(ability.name))) problems.push(""+set.species+" has illegal ability: "+ ability.name);
					for (let z in moves) 
						{
						let lsetData = {sources:[], sourcesBefore:0};
						let check1=TeamValidator('gen7ou').checkLearnset(this.getMove(moves[z]).id, !template1.learnset? originTemplate1.species:template1.species, lsetData, set);
						let check2=TeamValidator('gen7ou').checkLearnset(this.getMove(moves[z]).id, !template2.learnset? originTemplate2.species:template2.species, lsetData, set);
						console.log(check1);
						console.log(check2);
						if(check1==false|check2==false) continue;
						if(check1.type=='incompatible'|check2.type=='incompatible') continue;
						if(check1.type=='invalid'&check2.type=='invalid') problems.push(""+set.species+" has illegal move: "+moves[z]);
						}
					//Afterforme Check	
					if(ability.id=='powerconstruct'&&(template.speciesid=='zygarde'||template.speciesid=='zygarde10'))  template1=this.getTemplate('zygardecomplete');
					if(ability.id=='battlebond'&&template.speciesid=='greninja')  template1=this.getTemplate('greninjaash');
					if(set.item.id=='redorb'&&template.speciesid=='groudon')  template1=this.getTemplate('groudonprimal');
					if(set.item.id=='blueorb'&&template.speciesid=='kyogre')  template1=this.getTemplate('kyogreprimal');
					if(moves.includes('dragonascent')&&template.speciesid=='rayquaza')  template1=this.getTemplate('rayquazamega');
					if(ability.id=='schooling'&&template.speciesid=='wishiwashi') template1=this.getTemplate('wishiwashi-school');
					let stats={};
					
					if(!lessRules)
					{
						for(let stat in template2.baseStats)
						{
							stats[stat]=template2.baseStats[stat];
							stats[stat]=(stats[stat]+((this.getItem(set.item).megaEvolves==set.species)?this.getTemplate(this.getItem(set.item).megaStone).baseStats[stat]:template1.baseStats[stat]))/2;
							if((ability.id=='hugepower'||ability.id=='purepower'||(abilityAfterMega&&(abilityAfterMega.id=='purepower'||abilityAfterMega.id=='hugepower')) )&&stat=='atk') stats[stat]*=2;
							if(ability.id=='furcoat'&&stat=='def') stats[stat]*=2;
							stats[stat]=Math.floor(stats[stat]);
						}
						let b, c;
						let BST=Object.values(stats).reduce((b,c) =>(b+c));
						if(template1!=template2&BST>600||(template1.tier=='Uber'&template2.tier=='Uber'&&gameType!='doubles')||(doublesUbers.includes(template1.species)&&doublesUbers.includes(template2.species)&&gameType=='doubles'))
						{
							problems.push("Fusion of "+template1.species+" and "+template2.species+" is banned, because"+((BST>600)?' sum of stats is higher than 600':' they are both Uber'));
						}
					}
					if(template2.battleOnly&&template2.species!='Wishiwashi-School')
					{
						problems.push("Fusion of "+template2.species+" is banned, because this is battle forme");
					}
				}
			else
				{
				if (!abilityList.includes(ability.name)) return [""+set.species+" has illegal ability: "+ ability.name];
				if(!lessRules)
					{
						if(TeamValidator('gen7ou').validateSet(set)) problems.push(TeamValidator('gen7ou').validateSet(set));
						if ((template1.tier=='Uber'&&gameType!='doubles')||(doublesUbers.includes(template1.species)&&gameType=='doubles')) problems.push(""+set.species+" in Uber which is banned");
					}
					else if(TeamValidator('gen7uber').validateSet(set)) problems.push(TeamValidator('gen7uber').validateSet(set));
				 }
				//Complicate Banlist
				//if(ability.id=='speedboost'&((StatsSum0+StatsSum1)/2>500|set.item=='medichamite'|set.item=='mawilite')) problems.push(''+ability.name+ ' + sum of stats >500 or Medichamite/Mawilite' + ' is banned');
				//if(ability.id=='imposter'&template1!=template2)problems.push('Imposter is legal only for Ditto');
				//if((ability.id=='purepower'|ability.id=='hugepower')&((StatsSum0+StatsSum1)/2>500)) problems.push(''+ability.name+ ' + sum of stats >500' + ' is banned');
				if(template2!=template1&template2.exists)
				{
					if(!lessRules){
					switch(ability.id)
					{
						case 'protean': case 'fluffy': case 'simple': case 'imposter': case 'wonderguard':
					    problems.push('Ability ' + ability.name + ' is banned in fusions');
						break;
						case 'speedboost':
						if(gameType!='doubles') problems.push('Ability ' + abilityAfterMega.name + ' is banned in fusions');
						break;
					}
					if(abilityAfterMega){
						switch(abilityAfterMega.id)
						{
							case 'speedboost':
							if(gameType!='doubles') problems.push('Ability ' + abilityAfterMega.name + ' is banned in fusions');
							break;
						}
					}
					}
				}
				//Pokemons' Banlist
				if(template1.tier=='Illegal'|template2.tier=='Illegal'|template1.tier=='CAP'|template2.tier=='CAP') return [ "" + set.species + ' is illegal'];
				if(!lessRules){
				if((originTemplate1.speciesid=='deoxys'||originTemplate2.speciesid=='deoxys'||template1.speciesid=='deoxys'||template2.speciesid=='deoxys')&(template1.speciesid!='deoxysdefense'&template2.speciesid!='deoxysdefense')) problems.push('Only Deoxys-Defense is allowed');
				if(legalTiers&&(!legalTiers.includes(template1.tier)|!legalTiers.includes(template2.tier)|(item.megaEvolves!=undefined&&!legalTiers.includes(this.getTemplate(item.megaStone).tier)))) problems.push('Fusion of ' +template1.species+' contains illegal tier');
				//Moves' Banlist
				for(let z in moves)
					{
					let move=this.getMove(moves[z]);
					if(moves[z]=='vcreate'&&ability.id=='contrary') problems.push('Combination of '+ move.name + ' and ' + ability.name + ' is banned');
					if(moves[z]=='sleeptalk'&&ability.id=='comatose') problems.push('Combination of '+ move.name + ' and ' + ability.name + ' is banned');
					if(abilityAfterMega&&(moves[z]=='nightshade'||moves[z]=='seismictoss'||moves[z]=='psywave')&(abilityAfterMega=='parentalbond'||ability.id=='parentalbond')) problems.push('Combination of '+ move.name + ' and Parental Bond is banned');
					if(abilityAfterMega&&moves[z]=='electrify'&&(abilityAfterMega.id=='lightningrod'||ability.id=='lightningrod')) problems.push('Combination of' + move.name + ' and Lightning Rod is banned');
					if(move.accuracy<100&move.status=='slp'&(ability.id=='noguard'||(abilityAfterMega&&abilityAfterMega.id=='noguard'))) problems.push('Combination of '+ move.name + ' and No Guard is banned');
					}
				}
					return problems;
		},


		},


	fusion:
	{
	effectType: 'Rule',
	name: 'Fusion',
	onSwitchIn: function (pokemon) {		
			if(pokemon.name!=undefined)
			{
				let d=this.data['Pokedex'];
				let name=pokemon.name.substring(1,20);
				let template = this.getTemplate(pokemon.species);
				let template2 = this.getTemplate(pokemon.name.substring(1,20));
				if(!template2.exists)
				{
					name=pokemon.species;
					template2 =  pokemon.template;
				}
				let new_types=d[pokemon.template.speciesid].types;
				if(d[template2.speciesid].types!=pokemon.types&!pokemon.transformed)
						{
						if(d[template2.speciesid].types[1]!=undefined)
							{
							let f=d[pokemon.template.speciesid].types[0];
							let s=d[template2.speciesid].types[1];
							new_types={f,s};
							}
						else
							{
							let f=d[pokemon.template.speciesid].types[0];
							let s=d[template2.speciesid].types[0];
							new_types={f,s};
							}
						}
					if(new_types.f==new_types.s)
						{
						delete new_types.s;
						}
				if(this.getTemplate(pokemon.name.substring(1,20)).exists&&pokemon.species!=this.getTemplate(pokemon.name.substring(1,20))&&!pokemon.getVolatile('hybride')&&!pokemon.transformed)
					{
					pokemon.types=Object.values(new_types);
					this.add('-start', pokemon, 'typechange', pokemon.types.join('/'), '[silent]');
					if(!pokemon.transformed)
						{
						this.add('html', `<b>${""+pokemon.species+" + "+d[template2.speciesid].species+' base stats:'}</b>`);
						if(template2.exists)
							{
							// let image1;
							// let imageH;
							// let http = require('http');
							  // let options = {
							  // hostname: 'www.pokefusion.japeal.com',
							  // port: 80,
							  // path: ('/PKMColourV4.php?ver=3.0&p1='+template2.num+'&p2='+template.num+'34&c=0'),
							  // method: 'POST',
							  // headers: {
								// 'Content-Type': 'application/x-www-form-urlencoded',
							  // }
							// };
							// var req = http.request(options, (res) => {
							  // res.setEncoding('utf8');
							  // res.on('data', (chunk) => {
								// console.log(chunk);
								// if(chunk.includes('id="image1"')) image1=chunk;
								// if(chunk.includes('id="imageH"')) imageH=chunk;
							  // });
							  // res.on('end', () => {
								// console.log('No more data in response.')
							  // })
							// });

							// req.on('error', (e) => {
							  // console.log(`problem with request: ${e.message}`);
							// });
							// req.end();
							
							// let spr=`<div>${image1}${imageH}</div>`;
							if(template.num<152&&template2.num<152) this.add('html',`<details><summary>Спрайт</summary><p><img src="http://images.alexonsager.net/pokemon/fused/${template['num']}/${template['num']}.${template2.num}.png" width="100" height="100"></p></details>`);
							//if(template.num<400&&template2.num<400) this.add('html',`<details><summary>Спрайт</summary><p>${spr}</iframe></p></details>`);
							let baseStatsFusion={};
							for(let i in pokemon.baseStats)
								{
								baseStatsFusion[i]=Math.round((d[pokemon.template.speciesid].baseStats[i]+d[template2.speciesid].baseStats[i])/2);
								}
								let baseStatsFusionText=`<table><tr><b><th>HP</th><th>Attack</th><th>Defense</th><th>Sp.Attack</th><th>Sp.Defense</th><th>Speed</th></b></tr> <tr><td>${baseStatsFusion['hp']}</td><td>${baseStatsFusion['atk']}</td><td>${baseStatsFusion['def']}</td><td>${baseStatsFusion['spa']}</td><td>${baseStatsFusion['spd']}</td><td>${baseStatsFusion['spe']}</td></tr></table>`;
								//let baseStatsFusionText=`<b>${'HP:'}</b>${baseStatsFusion['hp']}<b>${' Attack:'}</b>${baseStatsFusion['atk']}<b>${' Defense:'}</b>${baseStatsFusion['def']}<b>${' Sp.Attack:'}</b>${baseStatsFusion['spa']}<b>${' Sp.Defense:'}</b>${baseStatsFusion['spd']}<b>${' Speed:'}</b>${baseStatsFusion['spe']}`;
								this.add('html', `<font size=0.95 color=#5c5c8a>${baseStatsFusionText}</font>`);
							}
						}
					pokemon.addVolatile('hybride');
					}
				/* if(pokemon.types!=Object.values(new_types))
				{
					pokemon.types=Object.values(new_types)
				} */
			}
		}
	},
	teampreview: {
		effectType: 'Rule',
		name: 'Team Preview',
		onStartPriority: -11,
		onStart: function () {
			this.add('clearpoke');
			for (let i = 0; i < this.sides[0].pokemon.length; i++) {
				let pokemon = this.sides[0].pokemon[i];
				let details = pokemon.details.replace(/(Arceus|Gourgeist|Genesect|Pumpkaboo|Silvally)(-[a-zA-Z?]+)?/g, '$1-*');
				this.add('poke', pokemon.side.id, details, pokemon.item ? 'item' : '');
			}
			for (let i = 0; i < this.sides[1].pokemon.length; i++) {
				let pokemon = this.sides[1].pokemon[i];
				let details = pokemon.details.replace(/(Arceus|Gourgeist|Genesect|Pumpkaboo|Silvally)(-[a-zA-Z?]+)?/g, '$1-*');
				this.add('poke', pokemon.side.id, details, pokemon.item ? 'item' : '');
			}
			this.add('html',`<font color=#18334e><b>${this.p1.name+'\'s team:'}</b></font>`); 
			let pokemonlist=[];
			let pokemonlist2=[];
			for(let p in this.p1.pokemon)
			{
				if(this.p1.pokemon[p].name&&this.getTemplate(this.p1.pokemon[p].name.substring(1,20)).exists)pokemonlist[p]=this.p1.pokemon[p].species+'+'+this.getTemplate(this.p1.pokemon[p].name.substring(1,20)).species; 
			}
			this.add('html',`  <div style="padding: 0px 0px 0px 0px;margin-Bottom: 8px;margin-Left: 15px;margin-Top=0";fontSize=12><font color=#254d74>${pokemonlist.join(' / ')}</font></div>`);
			this.add('html',`<b><font color=#73264b>${this.p2.name+'\'s team:'}</font></b>`); 
			for(let p in this.p2.pokemon)
			{
				if(this.p2.pokemon[p].name&&this.getTemplate(this.p2.pokemon[p].name.substring(1,20)).exists)pokemonlist2[p]=this.p2.pokemon[p].species+'+'+this.getTemplate(this.p2.pokemon[p].name.substring(1,20)).species; 
			}
			this.add('html',` <div style="padding: 0px 0px 0px 0px;margin-Bottom: 8px;margin-Left: 15px;margin-Top=0";fontSize=12><font color=#993364> ${pokemonlist2.join(' / ')}</font></div>`);
			},
			onTeamPreview: function () {
			this.makeRequest('teampreview');
		},
	},
	}

