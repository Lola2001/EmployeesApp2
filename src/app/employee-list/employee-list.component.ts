import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgFor, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, NgFor, NgClass],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==')
      .subscribe(data => {
        console.log('API Response:', data);
        this.employees = this.processData(data);
      });
  }

  processData(data: any[]): any[] {
    const employeeMap: { [key: string]: any } = {};

    data.forEach(entry => {
      const employeeName = entry.EmployeeName;

      if (!employeeName) {
        return;
      }

      const startTime = new Date(entry.StarTimeUtc);
      const endTime = new Date(entry.EndTimeUtc);
      const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      if (!employeeMap[employeeName]) {
        employeeMap[employeeName] = { name: employeeName, totalHours: 0 };
      }

      employeeMap[employeeName].totalHours += hoursWorked;
    });

    return Object.values(employeeMap).sort((a, b) => b.totalHours - a.totalHours);
  }

  isHighlight(employee: any): boolean {
    return employee.totalHours < 100;
  }

  editEmployee(employee: any): void {
    console.log('Edit employee:', employee);
  }
}
