import { Component, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { validateAppointmentDate } from '../appointment.validaton';
import { LucideAngularModule } from 'lucide-angular';
import { TaskComponent } from '../components/taks/task.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Service, Task } from '../../types';
import { NewTaskComponent } from '../components/new-task/new-task.component';
import { MatButtonModule } from '@angular/material/button';
import { AppointmentService } from '../../services/appointment.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentComponent } from '../components/payment.component';
import { PaymentService } from '../../services/payment.service';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    TaskComponent,
    MatDialogModule,
    DragDropModule,
    MatButtonModule,
    PaymentComponent,
  ],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css',
})
export class AppointmentComponent {
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  step: 'serviceSelection' | 'checkout' = 'serviceSelection';
  error: string = '';

  loading: boolean = false;
  appointmentForm = this.fb.group(
    {
      appointmentDate: [
        new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16),
        [Validators.required],
      ],
    },
    { validators: [validateAppointmentDate] }
  );
  openDialog() {
    this.dialog.open(NewTaskComponent, {
      data: {
        services: this.services,
        appointmentDate: this.latestServiceStartDate,
      },
      panelClass: 'w-1/3',
    });
  }

  onSubmit() {
    console.log(this.appointmentDate?.getRawValue());
    console.log('submit');
    this.paymentService.generatePaymentIntent(this.billAmount);
    this.step = 'checkout';
    this.error = '';
  }

  onPaymentSuccess(paymentId: string) {
    this.step = 'serviceSelection';
    this.appointmentService
      .saveNewAppointment(this.appointmentDate?.getRawValue(), paymentId)
      .subscribe({
        next: (result) => {
          if (result.type == HttpEventType.Response) {
            if (result.status == 201) {
              this.appointmentService.clearNewTasks();
              this.appointmentDate?.setValue(
                new Date(Date.now() + 4 * 3600 * 1000)
                  .toISOString()
                  .slice(0, 16)
              );
              this.router.navigate(['/customer']);
            }
          }
        },
        error: (error) => {
          this.error = error.message;
        },
      });
  }
  get appointmentDate() {
    return this.appointmentForm.get('appointmentDate');
  }

  drop(event: CdkDragDrop<Task[]>): void {
    this.appointmentService.reorderNewTasks(
      event.previousIndex,
      event.currentIndex,
      this.appointmentDateGMT3
    );
  }
  get services() {
    console.log(this.appointmentService.services);
    return [...this.appointmentService.services];
  }

  get appointmentDateGMT3() {
    return new Date(this.appointmentDate?.getRawValue());
  }

  get latestServiceStartDate() {
    const tasks = this.appointmentService.getNewTasks;
    if (tasks.length == 0) {
      return this.appointmentDateGMT3;
    }
    // added one minute for transition
    return new Date(tasks[tasks.length - 1].end.getTime() + 60_000);
  }

  get tasks() {
    return this.appointmentService.getNewTasks;
  }

  get billAmount() {
    return this.appointmentService.getTotalBillingAmount();
  }
}
