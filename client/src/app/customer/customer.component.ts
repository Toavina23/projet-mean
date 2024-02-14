import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
})
export class CustomerComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['login']);
    }
  }
}
