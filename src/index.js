import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Creature extends Card {
    getDescriptions() {
        return [
            getCreatureDescription(this),
            super.getDescriptions(this),
        ];
    };
}

class Duck extends Creature {
    constructor(name = "Мирная утка", maxPower = 2, image) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack')
    };

    swims() {
        console.log('float: both;')
    };
}

class Dog extends Creature {
    constructor(name = "Пес-бандит", maxPower = 3, image) {
        super(name, maxPower, image);
    }
}

class Trasher extends Dog {
    constructor(name = "Громила", maxPower = 5, image) {
        super(name, maxPower, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            value -= 1;
            if (value < 0) {
                value = 0;
            }
            super.modifyTakenDamage(value, fromCard, gameContext, continuation);
        });
    }

    getDescriptions() {
        return [
            "если Громилу атакуют, то он получает на 1 меньше урона.",
            super.getDescriptions(this),
        ];
    }
}

class Gatling extends Creature {
    constructor(name = "Гатлинг", maxPower = 6, image) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        for (let position = 0; position < oppositePlayer.table.length; position++) {
            taskQueue.push(onDone => {
                const card = oppositePlayer.table[position];
                if (card) {
                    this.dealDamageToCreature(this.currentPower, card, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    };
}

class Lad extends Dog {
    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return (this.getInGameCount() * (this.getInGameCount() + 1)) / 2;
    }

    constructor(name = 'Браток', maxPower = 2, image) {
        super(name, maxPower, image);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    };

    doBeforeRemoving(continuation) {
        if (Lad.getInGameCount() > 0) {
            Lad.setInGameCount(Lad.getInGameCount() - 1);
        }
        super.doBeforeRemoving(continuation);
    };

    modifyDealedDamageToCreature (value, toCard, gameContext, continuation) {
        value += Lad.getBonus();
        super.modifyDealedDamageToCreature(value, toCard, gameContext, continuation);
    };

    modifyTakenDamage (value, fromCard, gameContext, continuation) {
        if (value > 0) {
            value -= Lad.getBonus();
        }
        super.modifyTakenDamage(value, fromCard, gameContext, continuation);
    };


    getDescriptions() {
        const condition =
            Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')
            && Lad.prototype.hasOwnProperty('modifyTakenDamage');
        const description = condition ? ["Чем их больше, тем они сильнее"] : [];
        return  [
            ...description,
            ...super.getDescriptions(this),
        ];
    }

}

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}


// Основа для утки


// Основа для собаки.


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
