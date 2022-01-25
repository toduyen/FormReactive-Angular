import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {delay, filter, map, Observable, of, startWith, Subject, switchMap, take, tap, timer} from "rxjs";

@Component({
  selector: 'reactive-form-form-comp',
  templateUrl: './form-comp.component.html',
  styleUrls: ['./form-comp.component.scss']
})
export class FormCompComponent implements OnInit {
  formSubmit$ = new Subject<any>();
  singIntForm!:FormGroup;

  constructor(private fb:FormBuilder) { }

  ngOnInit(): void {
    this.singIntForm = this.fb.group({
      username: ["" , Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        Validators.pattern(/^[a-z]{6,32}$/i)
      ]),this.validateUserNameFromAPIDebounce.bind(this)],
      password: ["" , Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        Validators.pattern(/^[a-z]{6,32}$/i)
      ])],
      remember: false
    })


    this.formSubmit$
      .pipe(
        tap(() => this.singIntForm.markAsDirty()),
        switchMap(() =>
          this.singIntForm.statusChanges.pipe(
            startWith(this.singIntForm.status),
            filter(status => status !== "PENDING"),
            take(1)
          )
        ),
        filter(status => status === "VALID")
      )
      .subscribe(validationSuccessful => this.handleSubmit());
  }

  validateUsername(username: string): Observable<boolean> {
    console.log("Trigger API call");
    const existedUsers = ["trungvo", "tieppt", "chautran"];
    const isValid = existedUsers.every(x => x !== username);
    return of(isValid).pipe(delay(1000));
  }

  validateUserNameFromAPIDebounce(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return timer(300).pipe(
      switchMap(() =>
        this.validateUsername(control.value).pipe(
          map(isValid => {
            if (isValid) {
              return null;
            }
            return {
              usernameDuplicated: true
            };
          })
        )
      )
    );
  }

  handleSubmit(){
    console.log(this.singIntForm);
  }
}
