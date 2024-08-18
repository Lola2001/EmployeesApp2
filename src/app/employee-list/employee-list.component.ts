import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgFor, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';
import 'chartjs-plugin-datalabels'; 

Chart.register(...registerables);

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, NgFor, NgClass],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
  employees: any[] = [];
  chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };
  chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'chartArea'  
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (context.parsed !== null) {
              label += ': ' + context.parsed.toFixed(2) + ' hours';
            }
            return label;
          }
        }
      },
      datalabels: {
        color: '#ffffff',  
        formatter: (value: number, context: any) => {
          const total = context.chart?.getDatasetMeta(0)?.total;
          const percentage = total ? (value / total * 100).toFixed(1) + '%' : '0%';
          return percentage;
        },
        align: 'center',
        anchor: 'center',
        font: {
          weight: 'bold',
          size: 14
        }
      }
    }
  };
  chart: Chart<'pie'> | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==')
      .subscribe(data => {
        this.employees = this.processData(data);
        this.updateChart(); 
      });
  }

  ngAfterViewInit(): void {
    this.createChart();
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

  updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.employees.map(emp => emp.name);
      this.chart.data.datasets[0].data = this.employees.map(emp => emp.totalHours);
      this.chart.data.datasets[0].backgroundColor = this.employees.map(() => this.getRandomColor());
      this.chart.update();
    }
  }

  createChart(): void {
    const ctx = (document.getElementById('employeeChart') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: this.chartData,
        options: this.chartOptions
      });
    }
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
