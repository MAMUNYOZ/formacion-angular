import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducstRecommendedComponent } from './producst-recommended.component';

describe('ProducstRecommendedComponent', () => {
  let component: ProducstRecommendedComponent;
  let fixture: ComponentFixture<ProducstRecommendedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProducstRecommendedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProducstRecommendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
