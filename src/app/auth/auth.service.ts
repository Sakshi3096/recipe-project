import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { typeWithParameters } from "@angular/compiler/src/render3/util";
import { Injectable } from "@angular/core";
import { Subject, throwError, BehaviorSubject } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";


export interface AuthResponseData{
    kind:string;
    idToken:string;
    email:string;
    refreshToken:string;
    expiresIn:string;
    localId:string;
    registered?:boolean;
}
@Injectable({providedIn: 'root'})

export class AuthService{
    user =new BehaviorSubject<User>(null);
    //token :string = null;
    constructor(private http:HttpClient){}

    signup(email: string, password:string){
      return this.http.post<AuthResponseData>(
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD4j7H03_V9z2F0C6cDYdIrmgHQ6oSkx_I',
    {
   email:email,
   password:password,
   returnSecureToken: true
    }
       ).pipe(catchError(this.handleError), tap(resData=>{
         this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken, 
            +resData.expiresIn
            );
       })
       );

    }
    login(email:string, password:string){
return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD4j7H03_V9z2F0C6cDYdIrmgHQ6oSkx_I',
{
email:email,
password:password,
returnSecureToken: true
}
).pipe(catchError(this.handleError), 
tap(resData=>{
    this.handleAuthentication(
       resData.email,
       resData.localId,
       resData.idToken, 
       +resData.expiresIn
       );
    })
    );
    }

    

    private handleAuthentication(email: string,
        userId:string,
         token:string, 
         expiresIn:number){
        const expirationDate=new Date(new Date().getTime() +  expiresIn + 1000);
        const user= new User(
          email,
          userId,
          token,
          expirationDate
            );
        this.user.next(user);
    }

    handleError(errorRes:HttpErrorResponse){
        let errorMessage ='An unknown error';
        if(!errorRes.error.error || !errorRes.error){
            return throwError(errorMessage);
        }
        switch(errorRes.error.error.message){
       case 'EMAIL_EXISTS':
      errorMessage="This email already exist";
      break;
      case 'EMAIL_NOT_FOUND':{
        errorMessage="This email not found";
        break;
      }
      case 'INVALID_PASSWORD':{
        errorMessage="Password not valid";
        break;
      }
        }
        return throwError(errorMessage);
    }
}