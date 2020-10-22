import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountMyShoppingComponent } from './account-my-shopping.component';

describe('AccountMyShoppingComponent', () => {
  let component: AccountMyShoppingComponent;
  let fixture: ComponentFixture<AccountMyShoppingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountMyShoppingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountMyShoppingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
