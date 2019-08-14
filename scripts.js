'use strict';
let TeamValidator = require('../../../.sim-dist/team-validator.js').TeamValidator;
let Dex=require('../../../.sim-dist/dex.js').Dex;

let BattleScripts = {
	inherit: 'gen7',
	/*
	 * Main fuse function, used in every fusionmons format. 
	 * Takes template of first pokemon and itself pokemon
	 * Returns template of result pokemon
	 */
	
	fuse: function(template, pokemon)
	{	
		//Setup
		let pokedex=this.data['Pokedex'];
		let name=pokemon.species;
		let template1 = this.getTemplate(template.species); //First Pokemon
		let template2 =  this.getTemplate(template.species); //Second  Pokemon
		
		//Extract second pokemon from name of first pokemon
		if(pokemon.name) {
			name=pokemon.name.substring(1,20);
			template2 = this.getTemplate(name); 
			if(!template2.exists) {
				name=pokemon.species;
				template2 = template.baseTemplate;
			}
		}
		
		let item = this.getItem(pokemon.item);		
		// Arceus and Sylvally formes checking
		if (template.num === 493) {
			template1 = this.getTemplate(item && item.onPlate && this.getAbility(pokemon.ability).id=='multitype'? 'Arceus-' + item.onPlate : 'Arceus');
		} 
		else if(template.num === 773) {
			template1 = this.getTemplate(item && item.onMemory && this.getAbility(pokemon.ability).id=='rkssystem'? 'Silvally-' + item.onPlate : 'Silvally');
		}
		
		let stats=this.fuseStatsCalculate(template1, template2, pokemon.battle.cachedFormat.fusionmonsRules['Alternative']); //Used for new stats
		let new_types=[template1.types[0],template1.types[1]]; //Used for new types
		
		//Calculating of new types
		if(pokedex[template2.speciesid].types[0]!==pokemon.types[0] && pokedex[template2.speciesid].types[1]!==pokemon.types[1] && !pokemon.transformed) {
			if(pokedex[template2.speciesid].types[1]!==undefined) {
				new_types=[pokedex[template1.speciesid].types[0],pokedex[template2.speciesid].types[1]];
			}
			else {
				new_types=[pokedex[template1.speciesid].types[0],pokedex[template2.speciesid].types[0]];
			}
		}

		//Delete second type if they're both same
		if(new_types[0]===new_types[1]) new_types.pop();
	
		let templateResult=template1; //Result template
		pokemon.removeVolatile('hybride');
		//Assigning stats, weight, types to result template
		if (template2.exists && template2!=pokemon.baseTemplate && !pokemon.transformed) {
			let new_stats=this.spreadModify(stats, pokemon.set);
			templateResult.baseStats=stats;
			templateResult.stats=new_stats;
			templateResult.weightkg=(pokedex[pokemon.template.speciesid].weightkg+pokedex[template2.speciesid].weightkg)/2;
			templateResult.types=[new_types[0]];
			if(new_types[1]) templateResult.types.push(new_types[1]);
			pokemon.hp = new_stats['hp'] - (pokemon.maxhp - pokemon.hp);
			pokemon.maxhp=new_stats['hp'];
		}
		return templateResult;
	},
	
	info: function(pokemon,  apparentPokemon2 = null, apparentPokemon = null, apparentTypes = null) {
		let dex=this.data['Pokedex'];
		if(!apparentPokemon){
			apparentPokemon=pokemon;
		}
		if(!apparentTypes){
			apparentTypes=pokemon.types;
		}
		if(!apparentPokemon2){
			apparentPokemon2=pokemon.baseTemplate;
		}
		if(apparentPokemon2&&apparentPokemon.species!=apparentPokemon2.species&&!pokemon.transformed)
		{
		this.add('-start', pokemon, 'typechange', apparentTypes.join('/'), '[silent]');
		if(!pokemon.transformed)
			{
			this.add('html', `<b>${""+apparentPokemon.species+" + "+dex[apparentPokemon2.speciesid].species+' base stats:'}</b>`);
			if(apparentPokemon2.exists)
				{
					if(apparentPokemon.template.num<722&&apparentPokemon2.num<722) {
						let num1=apparentPokemon.template['num'];
						let num2=apparentPokemon2.num;
						num1+=(num1>386?4:0)+(num1>668?1:0)+(num1>669?4:0)+(num1>670?4:0)+(num1>671?4:0)+(num1>678?1:0)+(num1>681?1:0)+(num1>709?1:0)+(num1>718?2:0)+(num1>719?1:0)+(num1>720?1:0);
						num2+=(num2>386?4:0)+(num2>668?1:0)+(num2>669?4:0)+(num2>670?4:0)+(num2>671?4:0)+(num2>678?1:0)+(num2>681?1:0)+(num2>709?1:0)+(num2>718?2:0)+(num2>719?1:0)+(num2>720?1:0);
						this.add('html',`<details><summary>Спрайт</summary><p><img src="https://japeal.com/wordpress/wp-content/themes/total/PKM/upload2/${num1}X${num2}X0.png"></p></details>`);
					}
					let baseStatsFusion=this.fuseStatsCalculate(apparentPokemon.baseTemplate, apparentPokemon2, pokemon.battle.cachedFormat.fusionmonsRules['Alternative']);
					let baseStatsFusionText=`<table><tr><b><th>HP</th><th>Attack</th><th>Defense</th><th>Sp.Attack</th><th>Sp.Defense</th><th>Speed</th></b></tr> <tr><td>${baseStatsFusion['hp']}</td><td>${baseStatsFusion['atk']}</td><td>${baseStatsFusion['def']}</td><td>${baseStatsFusion['spa']}</td><td>${baseStatsFusion['spd']}</td><td>${baseStatsFusion['spe']}</td></tr></table>`;
					let minPossibleSpeed=Math.floor(Math.floor(Math.floor(2 * baseStatsFusion['spe']) * pokemon.set.level / 100 + 5)*0.9);
					let maxPossibleSpeed=Math.floor(Math.floor(Math.floor(2 * baseStatsFusion['spe'] + 31 + Math.floor(252 / 4)) * pokemon.set.level / 100 + 5)*1.1);
					this.add('html', `<font size=0.95 color=#5c5c8a>${baseStatsFusionText}Possible speed: ${minPossibleSpeed}-${maxPossibleSpeed}</font>`);
				}
			}
		}
	},
	afterMega: function(pokemon){
		pokemon.removeVolatile('hybride');
		let dex=this.data['Pokedex'];
		let name=pokemon.name.substring(1,20);
		let template = this.getTemplate(dex[pokemon.speciesid].otherFormes[0]);
		let template2 = this.getTemplate(pokemon.name.substring(1,20));
		if(!template2.exists)
		{
			name=pokemon.species;
			template2 =  template;
		}
		let types=this.fuseTypes(template.types, template2.types);
		let stats=this.fuseStatsCalculate(pokemon.template, template2, pokemon.battle.cachedFormat.fusionmonsRules['Alternative']);
		pokemon.baseStats=this.spreadModify(stats, pokemon.set);
		let newHp=Math.floor(Math.floor(2 * pokemon.template.baseStats['hp'] + pokemon.set.ivs['hp'] + Math.floor(pokemon.set.evs['hp'] / 4) + 100) * pokemon.level / 100 + 10);
		pokemon.hp = newHp - (pokemon.maxhp - pokemon.hp);
		pokemon.maxhp=newHp;
		pokemon.types=types;
		this.info(pokemon, template2, null, types);
	},
	
	fuseStatsCalculate: function(template1, template2, isAlternate){
		let pokedex=Dex.data['Pokedex'];
		let stats={};
		if(!isAlternate) {
			for(let stat in template1.baseStats) {
				stats[stat]=Math.floor((pokedex[template1.speciesid].baseStats[stat]+pokedex[template2.speciesid].baseStats[stat])/2);
			}
		}
		else
		{
			let BST1=0;
			let BST2=0;
			for(let stat in template1.baseStats){
				BST1+=pokedex[template1.speciesid].baseStats[stat];
				BST2+=pokedex[template2.speciesid].baseStats[stat];
			}
			for(let stat in template1.baseStats){
				stats[stat]=Math.floor(Math.max(BST1,BST2)*(((pokedex[template2.speciesid].baseStats[stat]/BST2)+(pokedex[template1.speciesid].baseStats[stat]/BST1))/2));
			}
		}
		return stats;
	},
	
	fuseLearnets: function(template1, template2, isAlternate) {
		let newLearnset={};

		let template1Learnset={};
		let template2Learnset={};
		let movedex=Dex.data['Movedex'];
		
		for(let i in movedex){
			let result=new TeamValidator('gen7uber').checkLearnset(i, template1.species);
			if(!result || result['type']!='invalid')
				template1Learnset[i]=true;
			result=new TeamValidator('gen7uber').checkLearnset(i, template2.species);
			if(!result || result['type']!='invalid')
				template2Learnset[i]=true;
		}
		
		if(template1.species==template2.species) return template1Learnset;
		if(!isAlternate){
			for(let i in template1Learnset){
				newLearnset[i]=true;
			}
			for(let i in template2Learnset){
				newLearnset[i]=true;
			}
		}
		else {
			let types=this.fuseTypes(template1.types, template2.types);
			for(let i in template1Learnset){
				let move=Dex.getMove(i);
				let effectiveness=(Dex.getEffectiveness(move.type, types[1]?types[1]:types[0])+Dex.getImmunity(move.type, types[1]?types[1]:types[0])-1)*(Dex.getEffectiveness(types[1]?types[1]:types[0], move.type)+Dex.getImmunity(types[1]?types[1]:types[0], move.type) - 1) >= 0;
				if((Dex.getEffectiveness(move.type, types[1]?types[1]:types[0]) <= 0 && effectiveness)|| //if move type not se to type2, and type2 not se to move type
				types.includes(move.type) || //if fuse types has move type
				template2Learnset[i] || //if pokemon2 has same move
				(template1.types[0]==types[0]&&template1.types[1]==types[1])) //if types of fuse is the same as the pokemon1 types
					newLearnset[i]=true;
			}
			for(let i in template2Learnset){
				let move=Dex.getMove(i);
				let effectiveness=(Dex.getEffectiveness(move.type, types[0])+Dex.getImmunity(move.type, types[0])-1)*(Dex.getEffectiveness(types[0], move.type)+Dex.getImmunity(types[0], move.type)-1) >= 0;
				if((Dex.getEffectiveness(move.type, types[0]) <= 0 && effectiveness)|| //if move type not se to type1, and type2 not se to move type
				types.includes(move.type) || //if fuse types has move type
				template1Learnset[i] || //if pokemon1 has same move
				(template2.types[0]==types[0]&&template2.types[1]==types[1])) //if types of fuse is the same as the pokemon2 types
					newLearnset[i]=true;
			}
		}
		return newLearnset;
	},
	
	fuseTypes: function(types1, types2) {
		let types=[types1[0],types2[1]?types2[1]:types2[0]];
		if(types[0]==types[1]) types.pop();
		return types;
	}
}
exports.BattleScripts = BattleScripts;