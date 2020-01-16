import {NgZone} from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as EventEmitter from 'eventemitter3';
import { Mods, IMods } from "../mods";
import { Option } from "app/core/service/settings.service";
import { ElectronService as electron } from "app/core/electron/electron.service";

export class Notifications extends Mods {

    wGame: any | Window;
    public eventEmitter: EventEmitter;

    constructor(wGame: any, private params: Option.Notification, private translate: TranslateService){
        super(wGame);
        this.eventEmitter = new EventEmitter();
        this.wGame = wGame;
        this.params = params;
        this.translate = translate;

        this.on(this.wGame.dofus.connectionManager, 'ChatServerMessage', (msg: any) => {
            this.sendMPNotif(msg);
        });
        this.on(this.wGame.gui, 'GameFightTurnStartMessage', (actor: any) => {
            this.sendFightTurnNotif(actor);
        });
        this.on(this.wGame.dofus.connectionManager, 'TaxCollectorAttackedMessage', (tc: any) => {
            this.sendTaxCollectorNotif(tc);
        });
        this.on(this.wGame.dofus.connectionManager, 'GameRolePlayArenaFightPropositionMessage', (e: any) => {
            this.sendKolizeumNotif(e);
        });
        this.on(this.wGame.dofus.connectionManager, 'PartyInvitationMessage', (e: any) => {
            this.sendPartyInvitationNotif(e);
        });
        this.on(this.wGame.dofus.connectionManager, 'GameRolePlayAggressionMessage', (e: any) => {
            this.sendAggressionNotif(e);
        });
        this.on(this.wGame.dofus.connectionManager, 'CharacterLevelUpInformationMessage', (e: any) => {
          this.sendLevelUpNotif(e);
        });
        this.on(this.wGame.dofus.connectionManager, 'InventoryWeightMessage', (e: any) => {
          this.sendFullPodsNotif(e);
        });
    }


    private sendMPNotif(msg: any) {
        if (!this.wGame.document.hasFocus() && this.params.private_message) {
            if (msg.channel == 9) {

                this.eventEmitter.emit('newNotification');

                let mpNotif = new Notification(this.translate.instant('app.notifications.private-message', {character: msg.senderName}), {
                    body: msg.content
                });

                mpNotif.onclick = () => {
                    electron.getCurrentWindow().focus();
                    this.eventEmitter.emit('focusTab');
                };
            }
        }
    }

    private sendFightTurnNotif(actor: any) {
        if (!this.wGame.document.hasFocus()
            && this.wGame.gui.playerData.characterBaseInformations.id == actor.id) {

            if (this.params.fight_turn) {

                this.eventEmitter.emit('newNotification');

                let turnNotif = new Notification(this.translate.instant('app.notifications.fight-turn', {character: this.wGame.gui.playerData.characterBaseInformations.name}));

                turnNotif.onclick = () => {
                    electron.getCurrentWindow().focus();
                    this.eventEmitter.emit('focusTab');
                };
            }

            if (this.params.focus_fight_turn) {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            }
        }
    }

    private sendKolizeumNotif(msg: any) {
        if (!this.wGame.document.hasFocus()
            && this.params.fight_turn) {

            this.eventEmitter.emit('newNotification');

            let kolizeumNotif = new Notification(this.translate.instant('app.notifications.kolizeum'));

            kolizeumNotif.onclick = () => {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            };
        }
    }

    private sendTaxCollectorNotif(tc: any) {
        if (!this.wGame.document.hasFocus() && this.params.tax_collector) {

            this.eventEmitter.emit('newNotification');

            let guildName = tc.guild.guildName;
            let x = tc.worldX;
            let y = tc.worldY;
            let zoneName = tc.enrichData.subAreaName;
            let tcName = tc.enrichData.firstName + " " + tc.enrichData.lastName;

            let taxCollectorNotif = new Notification(this.translate.instant('app.notifications.tax-collector'), {
                body: zoneName + ' [' + x + ', ' + y + '] : ' + guildName + ', ' + tcName
            });

            taxCollectorNotif.onclick = () => {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            };

        }
    }

    private sendPartyInvitationNotif(e: any) {
        if (!this.wGame.document.hasFocus() && this.params.party_invitation) {
            
            this.eventEmitter.emit('newNotification');

            let partyInvitationNotif = new Notification(this.translate.instant('app.notifications.party-invitation', {character: e.fromName}));

            partyInvitationNotif.onclick = () => {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            };
        }
    }

    private sendAggressionNotif(e: any) {
        if (!this.wGame.document.hasFocus()
            && this.params.aggression
            && e.defenderId == this.wGame.gui.playerData.characterBaseInformations.id) {
            
            this.eventEmitter.emit('newNotification');

            let aggressionNotif = new Notification(this.translate.instant('app.notifications.aggression'));

            aggressionNotif.onclick = () => {
                electron.getCurrentWindow().focus();
                this.eventEmitter.emit('focusTab');
            };
        }
    }

    private sendLevelUpNotif(e: any) {
      if (!this.wGame.document.hasFocus() && 
           this.params.level_up && 
           this.wGame.gui.playerData.characterBaseInformations.id == e.id) {

        this.eventEmitter.emit('newNotification');

        const levelUpNotif = new Notification(this.translate.instant('app.notifications.level-up', {character: e.name, level: e.newLevel}));

        levelUpNotif.onclick = () => {
          electron.getCurrentWindow().focus();
          this.eventEmitter.emit('focusTab');
        };
      }
    }

    private sendFullPodsNotif(e: any) {
      if (!this.wGame.document.hasFocus() && 
      this.wGame.gui.playerData.inventory.isOverloaded()) {
          
        this.eventEmitter.emit('newNotification');
        
        const fullPodsNotif = new Notification(this.translate.instant('app.notifications.full-pods', {character: e.name}));

        fullPodsNotif.onclick = () => {
          electron.getCurrentWindow().focus();
          this.eventEmitter.emit('focusTab');
        };
      }
    }

    public reset() {
        super.reset();
        this.eventEmitter.removeAllListeners();
    }

}
