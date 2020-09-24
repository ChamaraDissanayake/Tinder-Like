import { Component, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/Rx';
// import { StackConfig, Stack, Card, ThrowEvent, DragEvent, SwingStackComponent, SwingCardComponent } from 'angular2-swing';
import { StackConfig, DragEvent, SwingStackComponent, SwingCardComponent } from 'angular2-swing';
// import { of } from 'rxjs/observable/of';
// import { isYieldExpression } from 'typescript';

import { ProfilePage } from '../profile/profile';
import { ChatmainPage } from '../chatmain/chatmain';
import { ChatindPage } from '../chatind/chatind';
import { PhotoPage } from '../photo/photo';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('myswing1') swingStack: SwingStackComponent;
  @ViewChildren('mycards1') swingCards: QueryList<SwingCardComponent>;

  cards: Array<any>;
  stackConfig: StackConfig;
  recentCard: string = '';

  constructor
  (
    private http: Http,
    public navCtrl: NavController,
    private elementRef:ElementRef
  ) {
    this.dragImage();
  }

  ngOnInit(): void{
    this.setStyleLike('transparent');
    this.setStyleNope('transparent');
    this.setStyleLike('transparent');
  }
  
  ngAfterViewInit() {
    // Either subscribe in controller or set in HTML
    this.swingStack.throwin.subscribe((event: DragEvent) => {
      event.target.style.background = '#ffffff';
    });
    
    this.cards = [];
    this.addNewCards(3);
  }

  // Called whenever we drag an element
  onItemMove(element, x, y, r) {
    var color = '';
    var abs = Math.abs(x);
    let min = Math.trunc(Math.min(16*16 - abs, 16*16));
    let hexCode = this.decimalToHex(min, 2);
    
    if (x < 0) {
      color = '#FF' + hexCode + hexCode;
      this.setStyleNope(color);      
    } else {
      color = '#' + hexCode + 'FF' + hexCode;
      this.setStyleLike(color);      
    }
    
    element.style.background = color;
    element.style['transform'] = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;
  }

  onItemMoveSuper(element, x, y, r) {
    var color = '';
    var abs = Math.abs(y);
    let min = Math.trunc(Math.min(16*16 - abs, 16*16));
    let hexCode = this.decimalToHex(min, 2);
  
    if (y < 0) {
      color = '#' + hexCode + hexCode + 'FF';
      this.setStyleSuperLike(color);
    } else {
      color = '#' + 'FF' + 'FF' + hexCode;
    }
    
    element.style.background = color;
    element.style['transform'] = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;
  }
  
  // Connected through HTML
  voteUp(like: boolean) {
    // let removedCard = this.cards.shift();
    let removedCard = this.cards.pop();

    if(this.cards.length<4){
      this.addNewCards(4-this.cards.length);
    }
    if (like) {
      this.recentCard = 'You liked: ' + removedCard.email;
    } else {
      this.recentCard = 'You disliked: ' + removedCard.email;
    }

    setTimeout(() => {
      this.setStyleLike('transparent');
      this.setStyleNope('transparent');
      this.setStyleLike('transparent');
    }, 500);
  }

  voteSuper(superLike: boolean) {
    // let removedCard = this.cards.shift();
    let removedCard = this.cards.pop();

    if(this.cards.length<4){
      this.addNewCards(4-this.cards.length);
    }
    if (superLike) {
      this.recentCard = 'You super liked: ' + removedCard.email;
    } else {
      this.recentCard = 'You skipped: ' + removedCard.email;
    }
    setTimeout(() => {
      this.setStyleLike('transparent');
      this.setStyleNope('transparent');
      this.setStyleSuperLike('transparent');
    }, 500);  
  }
  
  // Add new cards to our array
  addNewCards(count: number) {
    this.http.get('https://randomuser.me/api/?results=' + count)
    .map(data => data.json().results)
    .subscribe(result => {
      for (let val of result) {        
        this.cards.push(val);
      }
    })    
  }
  
  // http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    
    while (hex.length < padding) {
      hex = "0" + hex;
    }
    
    return hex;
  }

  dragImage(){
    let minThrowDistance: any;
    let positiveOffsetX: any;
    let positiveOffsetY: any;
    let positiveX: any;
    let positiveY: any;
    
    this.stackConfig = {      
      throwOutConfidence: (offsetX, offsetY, element) => {
        
        if(offsetY<0){
          positiveOffsetY = -1 * offsetY;
        } else {
          positiveOffsetY = offsetY;
        }
        if(offsetX<0){
          positiveOffsetX = -1 * offsetX;
        } else {
          positiveOffsetX = offsetX;
        }
        
        if(positiveOffsetX>=positiveOffsetY){
          minThrowDistance = Math.min(Math.abs(offsetX) / (element.offsetWidth/2), 1);
        } else {
          minThrowDistance = Math.min(Math.abs(offsetY) / (element.offsetWidth/2), 1);
        }
        return minThrowDistance;
      },
      transform: (element, x, y, r) => {
        if(y<0){
          positiveY = -1 * y;
        } else {
          positiveY = y;
        }
        if(x<0){
          positiveX = -1 * x;
        } else {
          positiveX = x;
        }

        if(positiveY>positiveX){
          this.onItemMoveSuper(element, x, y, r);  
        } else {
          this.onItemMove(element, x, y, r);
        }        
      },
      throwOutDistance: (d) => {
        return 800;
      }
    };
  }

  setStyleLike(value: string): void {
    this.elementRef.nativeElement.style.setProperty('--set-color-like', value);
    this.elementRef.nativeElement.style.setProperty('--set-color-nope', 'transparent');
    this.elementRef.nativeElement.style.setProperty('--set-color-super-like', 'transparent');
  }
  
  setStyleNope(value: string): void {
    this.elementRef.nativeElement.style.setProperty('--set-color-like', 'transparent');
    this.elementRef.nativeElement.style.setProperty('--set-color-nope', value);
    this.elementRef.nativeElement.style.setProperty('--set-color-super-like', 'transparent');
  }

  setStyleSuperLike(value: string): void {
    this.elementRef.nativeElement.style.setProperty('--set-color-like', 'transparent');
    this.elementRef.nativeElement.style.setProperty('--set-color-nope', 'transparent');
    this.elementRef.nativeElement.style.setProperty('--set-color-super-like', value);
  }

  prof(){
    this.navCtrl.push(ProfilePage);
  }
  chatm(){
    this.navCtrl.push(ChatmainPage);    
  }
  chatid(){
    this.navCtrl.push(ChatindPage)
  }
  pho(){
    this.navCtrl.push(PhotoPage)
  }
  lgn(){
    this.navCtrl.push(LoginPage)
  }
}
