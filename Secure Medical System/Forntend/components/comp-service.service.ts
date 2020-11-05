import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Console } from 'console';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CompServiceService {

  private messageNewSubmit = new BehaviorSubject<any>(true);
  currentMessage = this.messageNewSubmit.asObservable();

  private messageBidAccept = new BehaviorSubject<any>(true);
  currentBidMessage = this.messageBidAccept.asObservable();

  private messageDash = new BehaviorSubject<any>(true);
  currentDashMessage = this.messageDash.asObservable();


  allRequestData: string[][] = [];
  allBidAcceptData: string[][] = [];
  isDash1: boolean = true;
  isDash2: boolean = false;
  isDash3:boolean = false;


  constructor(@Inject(DOCUMENT) private document: Document) 
  {

  }

  // submitNewRequest(msg: any)
  // {
  //   this.messageNewSubmit.next(msg);
  //   // console.log("New submit message received.." + msg);
  //   this.allRequestData.push(msg);
  //   console.log("New submit message received.." + this.allRequestData);
    
  //   // return msg;
  //   // this.selectedID = ID;
  // }

  // acceptBid(bidData: any)
  // {
  //   this.messageBidAccept.next(bidData);
  //   this.allBidAcceptData.push(bidData);
  //   // console.log("Bid accepted in service: " + bidData);

  //   // console.log("All accepted Bid Data: " + this.allBidAcceptData);
    
  // }

  // getAllRequestData()
  // {
  //   return this.allRequestData;
  // }
  // getAllBidAcceptedData()
  // {
  //   return this.allBidAcceptData;
  // }
  // getNewRequest()
  // {
  //   console.log("Subscribing message");
  //   return this.currentMessage;
  // }
  // getBidAccept()
  // {
  //   return this.currentBidMessage;
  // }
  updateDash(isD1:boolean)
  {
    this.messageDash.next(this.isDash1);
    this.isDash1 = isD1;
    console.log("%%%%%%%%%%% Received dash value in service: " + this.isDash1);
  }
  getDash()
  {
    // console.log("The current page is: " + this.document.location.href);
    var pageLink = this.document.location.href;
    if (pageLink.substring(pageLink.length - 1) == "1")
    {
        this.isDash1 = true;
        this.isDash3 = false;
    }
    else if (pageLink.substring(pageLink.length - 1) == "2")
    {
        this.isDash1 = false;
        this.isDash3 = false;
    }
    else if (pageLink.substring(pageLink.length - 1) == "3")
    {
        this.isDash1 = false;
        this.isDash3 = true;
    }
    else
    {
      this.isDash1 = true;
    }
    return this.isDash1;
  }
  getDash1()
  {
    var pageLink = this.document.location.href;
    if (pageLink.substring(pageLink.length - 1) == "1")
    {
        this.isDash1 = true;
    }
    else
    {
      this.isDash1 = false;
    }
    return this.isDash1;
  }
  getDash2()
  {
    var pageLink = this.document.location.href;
    if (pageLink.substring(pageLink.length - 1) == "2")
    {
        this.isDash2 = true;
    }
    else
    {
      this.isDash2 = false;
    }
    return this.isDash2;
  }
  getDash3()
  {
    var pageLink = this.document.location.href;
    if (pageLink.substring(pageLink.length - 1) == "3")
    {
        this.isDash3 = true;
    }
    else
    {
      this.isDash3 = false;
    }
    return this.isDash3;
  }

  getDashMessage()
  {
    return this.currentDashMessage;
  }

}
