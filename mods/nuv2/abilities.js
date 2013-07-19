 exports.BattleAbilities = {
  "reckless": {
		desc: "When this Pokemon uses an attack that causes recoil damage, or an attack that has a chance to cause recoil damage such as Jump Kick and Hi Jump Kick, the attacks's power receives a 30% boost.",
		shortDesc: "This Pokemon's attacks with recoil or crash damage do 1.3x damage; not Struggle.",
		onBasePower: function(basePower, attacker, defender, move) {
			if (move.recoil || move.hasCustomRecoil) {
				this.debug('Reckless boost');
				return basePower * 13/10;
			}
		},
		id: "reckless",
		name: "Reckless",
		rating: 3,
		num: 120
	},
	"purepower": {
		desc: "This Pokemon's Special Attack stat is doubled. Therefore, if this Pokemon's Special Attack stat on the status screen is 200, it effectively has an Special Attack stat of 400; which is then subject to the full range of stat boosts and reductions.",
		shortDesc: "This Pokemon's Special Attack is doubled.",
		onModifyAtk: function(spa) {
			return spa * 2;
		},
		id: "purepower",
		name: "Pure Power",
		rating: 5,
		num: 74
	},
	"telepathy": {
			desc: "When a Pokemon with Telepathy faints another Pokemon, its Special Attack rises by one stage.",
		shortDesc: "This Pokemon's Special Attack is boosted by 1 if it attacks and faints another Pokemon.",
		onSourceFaint: function(target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({spa:1}, source);
			}
		},
		id: "telepathy",
		name: "Telepathy",
		rating: 4,
		num: 140
	}
};
