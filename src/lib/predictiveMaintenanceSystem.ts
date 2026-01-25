/**
 * Predictive Maintenance System for Forza Horizon 5 Tuning
 * Analyzes component wear, predicts failures, and recommends maintenance
 * Tracks vehicle health and provides proactive maintenance alerts
 */

export interface ComponentHealth {
  component: string;
  health: number; // 0-100% (100 = perfect, 0 = failed)
  wearRate: number; // percentage per hour of use
  estimatedLife: number; // hours remaining
  lastInspection: number; // timestamp
  maintenanceHistory: Array<{
    date: number;
    type: 'inspection' | 'repair' | 'replacement';
    cost: number;
    notes: string;
  }>;
  alerts: Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
    actionRequired: string;
    deadline?: number; // timestamp
  }>;
}

export interface VehicleHealthReport {
  overallHealth: number; // 0-100%
  componentHealth: ComponentHealth[];
  maintenanceSchedule: Array<{
    component: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    recommendedAction: string;
    estimatedCost: number;
    deadline: number;
    reason: string;
  }>;
  performanceImpact: {
    current: number; // percentage performance loss
    projected: number; // projected loss if maintenance delayed
    optimal: number; // performance gain from maintenance
  };
  riskAssessment: {
    breakdownRisk: 'low' | 'medium' | 'high' | 'critical';
    reliability: number; // 0-100%
    recommendations: string[];
  };
}

export interface UsageData {
  totalHours: number;
  trackHours: number;
  streetHours: number;
  raceHours: number;
  lastService: number; // timestamp
  averageSessionLength: number; // minutes
  harshDrivingPercentage: number; // 0-100%
  environmentalExposure: {
    rainHours: number;
    dustHours: number;
    extremeTempHours: number;
  };
}

export interface MaintenanceRecommendation {
  component: string;
  urgency: 'immediate' | 'soon' | 'scheduled' | 'monitor';
  action: string;
  reason: string;
  estimatedCost: number;
  expectedBenefit: string;
  alternativeActions: string[];
}

export class PredictiveMaintenanceSystem {
  private componentDatabase: Map<string, ComponentHealth> = new Map();
  private usageHistory: UsageData[] = [];

  constructor() {
    this.initializeComponentDatabase();
  }

  /**
   * Generate comprehensive vehicle health report
   */
  public generateHealthReport(
    vehicleId: string,
    currentUsage: UsageData,
    performanceData?: {
      lapTimes: number[];
      tireWear: number[];
      brakeTemps: number[];
      engineTemps: number[];
    }
  ): VehicleHealthReport {
    // Update usage history
    this.usageHistory.push(currentUsage);

    // Analyze each component
    const componentHealth = Array.from(this.componentDatabase.values()).map(component =>
      this.analyzeComponentHealth(component, currentUsage, performanceData)
    );

    // Calculate overall health
    const overallHealth = this.calculateOverallHealth(componentHealth);

    // Generate maintenance schedule
    const maintenanceSchedule = this.generateMaintenanceSchedule(componentHealth, currentUsage);

    // Assess performance impact
    const performanceImpact = this.assessPerformanceImpact(componentHealth, performanceData);

    // Risk assessment
    const riskAssessment = this.assessRisk(componentHealth, currentUsage);

    return {
      overallHealth,
      componentHealth,
      maintenanceSchedule,
      performanceImpact,
      riskAssessment
    };
  }

  /**
   * Analyze individual component health
   */
  private analyzeComponentHealth(
    component: ComponentHealth,
    usage: UsageData,
    performanceData?: any
  ): ComponentHealth {
    const updatedComponent = { ...component };

    // Calculate wear based on usage patterns
    const wearMultiplier = this.calculateWearMultiplier(usage, component.component);
    const timeSinceLastInspection = Date.now() - component.lastInspection;
    const hoursSinceLastInspection = timeSinceLastInspection / (1000 * 60 * 60);

    // Update health based on wear
    const wearAmount = component.wearRate * hoursSinceLastInspection * wearMultiplier;
    updatedComponent.health = Math.max(0, component.health - wearAmount);

    // Recalculate estimated life
    if (updatedComponent.health > 0) {
      updatedComponent.estimatedLife = (updatedComponent.health / 100) / component.wearRate;
    } else {
      updatedComponent.estimatedLife = 0;
    }

    // Generate alerts based on health
    updatedComponent.alerts = this.generateComponentAlerts(updatedComponent, usage);

    // Update performance data if available
    if (performanceData) {
      this.updateHealthFromPerformanceData(updatedComponent, performanceData);
    }

    return updatedComponent;
  }

  /**
   * Calculate wear multiplier based on usage conditions
   */
  private calculateWearMultiplier(usage: UsageData, componentType: string): number {
    let multiplier = 1.0;

    // Racing increases wear
    multiplier *= 1 + (usage.raceHours / usage.totalHours) * 2;

    // Harsh driving increases wear
    multiplier *= 1 + (usage.harshDrivingPercentage / 100) * 1.5;

    // Environmental factors
    multiplier *= 1 + (usage.environmentalExposure.rainHours / usage.totalHours) * 0.5;
    multiplier *= 1 + (usage.environmentalExposure.dustHours / usage.totalHours) * 0.8;
    multiplier *= 1 + (usage.environmentalExposure.extremeTempHours / usage.totalHours) * 0.6;

    // Component-specific multipliers
    switch (componentType) {
      case 'brake-pads':
        multiplier *= usage.raceHours > usage.totalHours * 0.3 ? 3 : 1;
        break;
      case 'tires':
        multiplier *= usage.trackHours > usage.totalHours * 0.5 ? 2.5 : 1;
        break;
      case 'engine':
        multiplier *= usage.harshDrivingPercentage > 50 ? 1.8 : 1;
        break;
      case 'transmission':
        multiplier *= usage.harshDrivingPercentage > 70 ? 2.2 : 1;
        break;
    }

    return multiplier;
  }

  /**
   * Generate alerts for component health issues
   */
  private generateComponentAlerts(component: ComponentHealth, usage: UsageData): ComponentHealth['alerts'] {
    const alerts: ComponentHealth['alerts'] = [];

    if (component.health < 20) {
      alerts.push({
        level: 'critical',
        message: `${component.component} is critically worn`,
        actionRequired: 'Replace immediately to prevent failure',
        deadline: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      });
    } else if (component.health < 40) {
      alerts.push({
        level: 'warning',
        message: `${component.component} needs attention`,
        actionRequired: 'Schedule replacement soon',
        deadline: Date.now() + (7 * 24 * 60 * 60 * 1000) // 1 week
      });
    } else if (component.health < 60) {
      alerts.push({
        level: 'info',
        message: `${component.component} showing wear`,
        actionRequired: 'Monitor condition and plan replacement'
      });
    }

    // Time-based alerts
    if (component.estimatedLife < 10) {
      alerts.push({
        level: 'warning',
        message: `${component.component} approaching end of life`,
        actionRequired: 'Prepare for replacement'
      });
    }

    return alerts;
  }

  /**
   * Update component health based on performance data
   */
  private updateHealthFromPerformanceData(
    component: ComponentHealth,
    performanceData: any
  ): void {
    // Analyze performance data to detect component issues
    switch (component.component) {
      case 'brake-pads':
        if (performanceData.brakeTemps.some((temp: number) => temp > 800)) {
          component.health -= 2; // Overheating damages brakes
        }
        break;

      case 'engine':
        if (performanceData.engineTemps.some((temp: number) => temp > 110)) {
          component.health -= 1; // High temps indicate stress
        }
        break;

      case 'transmission':
        // Transmission wear can be inferred from inconsistent lap times
        const lapTimeVariance = this.calculateVariance(performanceData.lapTimes);
        if (lapTimeVariance > 5) { // High variance indicates transmission issues
          component.health -= 0.5;
        }
        break;
    }

    component.health = Math.max(0, Math.min(100, component.health));
  }

  /**
   * Calculate overall vehicle health
   */
  private calculateOverallHealth(componentHealth: ComponentHealth[]): number {
    if (componentHealth.length === 0) return 100;

    // Weighted average based on component criticality
    const weights: Record<string, number> = {
      'engine': 0.25,
      'transmission': 0.20,
      'brakes': 0.15,
      'suspension': 0.10,
      'tires': 0.10,
      'aero': 0.05,
      'exhaust': 0.05,
      'cooling': 0.10
    };

    let totalWeightedHealth = 0;
    let totalWeight = 0;

    componentHealth.forEach(component => {
      const weight = weights[component.component] || 0.1;
      totalWeightedHealth += component.health * weight;
      totalWeight += weight;
    });

    return Math.round(totalWeightedHealth / totalWeight);
  }

  /**
   * Generate maintenance schedule
   */
  private generateMaintenanceSchedule(
    componentHealth: ComponentHealth[],
    usage: UsageData
  ): VehicleHealthReport['maintenanceSchedule'] {
    const schedule: VehicleHealthReport['maintenanceSchedule'] = [];

    componentHealth.forEach(component => {
      if (component.alerts.length > 0) {
        const highestAlert = component.alerts.sort((a, b) =>
          this.getAlertPriority(b.level) - this.getAlertPriority(a.level)
        )[0];

        schedule.push({
          component: component.component,
          priority: this.alertLevelToPriority(highestAlert.level),
          recommendedAction: highestAlert.actionRequired,
          estimatedCost: this.estimateMaintenanceCost(component.component, highestAlert.level),
          deadline: highestAlert.deadline || Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days default
          reason: highestAlert.message
        });
      }
    });

    // Sort by priority and deadline
    return schedule.flat().sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.deadline - b.deadline;
    });
  }

  /**
   * Assess performance impact of component wear
   */
  private assessPerformanceImpact(
    componentHealth: ComponentHealth[],
    performanceData?: any
  ): VehicleHealthReport['performanceImpact'] {
    let currentLoss = 0;
    let projectedLoss = 0;
    let potentialGain = 0;

    componentHealth.forEach(component => {
      const healthLoss = (100 - component.health) / 100;

      // Component-specific performance impact
      const impactMultiplier = this.getPerformanceImpactMultiplier(component.component);
      currentLoss += healthLoss * impactMultiplier;

      // Projected loss (assuming continued use without maintenance)
      const projectedHealth = Math.max(0, component.health - (component.wearRate * 24)); // 24 hours
      const projectedHealthLoss = (100 - projectedHealth) / 100;
      projectedLoss += projectedHealthLoss * impactMultiplier;

      // Potential gain from maintenance
      potentialGain += (100 - component.health) / 100 * impactMultiplier * 0.8; // 80% restoration
    });

    return {
      current: Math.round(currentLoss * 100),
      projected: Math.round(projectedLoss * 100),
      optimal: Math.round(potentialGain * 100)
    };
  }

  /**
   * Assess overall risk level
   */
  private assessRisk(
    componentHealth: ComponentHealth[],
    usage: UsageData
  ): VehicleHealthReport['riskAssessment'] {
    const criticalComponents = componentHealth.filter(c => c.health < 20);
    const warningComponents = componentHealth.filter(c => c.health < 40 && c.health >= 20);

    let breakdownRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalComponents.length > 0) breakdownRisk = 'critical';
    else if (warningComponents.length > 2) breakdownRisk = 'high';
    else if (warningComponents.length > 0) breakdownRisk = 'medium';

    // Calculate reliability score
    const avgHealth = componentHealth.reduce((sum, c) => sum + c.health, 0) / componentHealth.length;
    const reliability = Math.round(avgHealth * 0.9); // Slight penalty for age/wear

    const recommendations: string[] = [];

    if (breakdownRisk === 'critical') {
      recommendations.push('Immediate maintenance required - do not drive until addressed');
    } else if (breakdownRisk === 'high') {
      recommendations.push('Schedule maintenance within 1-2 weeks');
      recommendations.push('Avoid high-performance driving until serviced');
    } else if (breakdownRisk === 'medium') {
      recommendations.push('Monitor component health closely');
      recommendations.push('Schedule maintenance during next service interval');
    }

    if (usage.harshDrivingPercentage > 60) {
      recommendations.push('Reduce harsh driving to extend component life');
    }

    return {
      breakdownRisk,
      reliability,
      recommendations
    };
  }

  /**
   * Get performance impact multiplier for component type
   */
  private getPerformanceImpactMultiplier(componentType: string): number {
    const multipliers: Record<string, number> = {
      'engine': 0.8,      // Major impact
      'transmission': 0.6,
      'brakes': 0.4,
      'suspension': 0.3,
      'tires': 0.5,
      'aero': 0.2,
      'cooling': 0.3,
      'exhaust': 0.1
    };

    return multipliers[componentType] || 0.2;
  }

  /**
   * Calculate variance in array
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    return Math.sqrt(variance); // Standard deviation
  }

  /**
   * Convert alert level to priority
   */
  private getAlertPriority(level: string): number {
    const priorities = { critical: 3, warning: 2, info: 1 };
    return priorities[level as keyof typeof priorities] || 0;
  }

  /**
   * Convert alert level to maintenance priority
   */
  private alertLevelToPriority(level: string): 'low' | 'medium' | 'high' | 'critical' {
    const mapping = {
      critical: 'critical' as const,
      warning: 'high' as const,
      info: 'medium' as const
    };
    return mapping[level as keyof typeof mapping] || 'low';
  }

  /**
   * Estimate maintenance cost
   */
  private estimateMaintenanceCost(component: string, severity: string): number {
    const baseCosts: Record<string, number> = {
      'brake-pads': 150,
      'brake-rotors': 300,
      'tires': 800,
      'engine-oil': 80,
      'air-filter': 50,
      'spark-plugs': 120,
      'transmission-fluid': 150,
      'suspension': 400,
      'aero-parts': 600
    };

    const baseCost = baseCosts[component] || 200;

    // Severity multiplier
    const severityMultiplier = severity === 'critical' ? 2.0 : severity === 'warning' ? 1.5 : 1.0;

    return Math.round(baseCost * severityMultiplier);
  }

  /**
   * Initialize component database with typical vehicle components
   */
  private initializeComponentDatabase(): void {
    const components: ComponentHealth[] = [
      {
        component: 'engine',
        health: 95,
        wearRate: 0.02, // 2% per hour under normal use
        estimatedLife: 2000,
        lastInspection: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        maintenanceHistory: [
          {
            date: Date.now() - (90 * 24 * 60 * 60 * 1000),
            type: 'inspection',
            cost: 150,
            notes: 'Regular maintenance - oil change'
          }
        ],
        alerts: []
      },
      {
        component: 'transmission',
        health: 92,
        wearRate: 0.015,
        estimatedLife: 3000,
        lastInspection: Date.now() - (45 * 24 * 60 * 60 * 1000),
        maintenanceHistory: [],
        alerts: []
      },
      {
        component: 'brakes',
        health: 88,
        wearRate: 0.05,
        estimatedLife: 800,
        lastInspection: Date.now() - (20 * 24 * 60 * 60 * 1000),
        maintenanceHistory: [],
        alerts: []
      },
      {
        component: 'suspension',
        health: 90,
        wearRate: 0.01,
        estimatedLife: 5000,
        lastInspection: Date.now() - (60 * 24 * 60 * 60 * 1000),
        maintenanceHistory: [],
        alerts: []
      },
      {
        component: 'tires',
        health: 85,
        wearRate: 0.08,
        estimatedLife: 500,
        lastInspection: Date.now() - (7 * 24 * 60 * 60 * 1000),
        maintenanceHistory: [],
        alerts: []
      },
      {
        component: 'cooling',
        health: 96,
        wearRate: 0.008,
        estimatedLife: 6000,
        lastInspection: Date.now() - (25 * 24 * 60 * 60 * 1000),
        maintenanceHistory: [],
        alerts: []
      },
      {
        component: 'aero',
        health: 98,
        wearRate: 0.005,
        estimatedLife: 10000,
        lastInspection: Date.now() - (90 * 24 * 60 * 60 * 1000),
        maintenanceHistory: [],
        alerts: []
      },
      {
        component: 'exhaust',
        health: 94,
        wearRate: 0.012,
        estimatedLife: 4000,
        lastInspection: Date.now() - (35 * 24 * 60 * 60 * 1000),
        maintenanceHistory: [],
        alerts: []
      }
    ];

    components.forEach(component => this.componentDatabase.set(component.component, component));
  }

  /**
   * Update component health after maintenance
   */
  public recordMaintenance(
    componentType: string,
    maintenanceType: 'inspection' | 'repair' | 'replacement',
    cost: number,
    notes: string
  ): void {
    const component = this.componentDatabase.get(componentType);
    if (component) {
      // Reset health for replacement, improve for repair
      if (maintenanceType === 'replacement') {
        component.health = 100;
      } else if (maintenanceType === 'repair') {
        component.health = Math.min(100, component.health + 30);
      }

      // Add to maintenance history
      component.maintenanceHistory.push({
        date: Date.now(),
        type: maintenanceType,
        cost,
        notes
      });

      component.lastInspection = Date.now();

      // Clear existing alerts for this component
      component.alerts = component.alerts.filter(alert =>
        !alert.message.toLowerCase().includes(componentType.toLowerCase())
      );
    }
  }

  /**
   * Get predictive maintenance recommendations
   */
  public getPredictiveRecommendations(usage: UsageData): MaintenanceRecommendation[] {
    const recommendations: MaintenanceRecommendation[] = [];
    const healthReport = this.generateHealthReport('vehicle', usage);

    healthReport.maintenanceSchedule.forEach(item => {
      const urgency = this.calculateUrgency(item.deadline, item.priority);

      recommendations.push({
        component: item.component,
        urgency,
        action: item.recommendedAction,
        reason: item.reason,
        estimatedCost: item.estimatedCost,
        expectedBenefit: `Restore ${item.component} performance and prevent failures`,
        alternativeActions: this.getAlternativeActions(item.component, urgency)
      });
    });

    return recommendations;
  }

  /**
   * Calculate maintenance urgency
   */
  private calculateUrgency(deadline: number, priority: string): 'immediate' | 'soon' | 'scheduled' | 'monitor' {
    const daysUntilDeadline = (deadline - Date.now()) / (24 * 60 * 60 * 1000);

    if (priority === 'critical' || daysUntilDeadline < 1) return 'immediate';
    if (priority === 'high' || daysUntilDeadline < 7) return 'soon';
    if (daysUntilDeadline < 30) return 'scheduled';

    return 'monitor';
  }

  /**
   * Get alternative maintenance actions
   */
  private getAlternativeActions(component: string, urgency: string): string[] {
    const alternatives: Record<string, string[]> = {
      'brake-pads': [
        'Install performance brake pads',
        'Resurface existing rotors',
        'Upgrade brake fluid'
      ],
      'tires': [
        'Rotate tires to even wear',
        'Adjust tire pressures',
        'Install tires with different compound'
      ],
      'engine': [
        'Change oil and filter',
        'Clean air filter',
        'Adjust ignition timing'
      ],
      'transmission': [
        'Change transmission fluid',
        'Adjust clutch pressures',
        'Clean transmission filter'
      ]
    };

    return alternatives[component] || ['Consult professional mechanic'];
  }

  /**
   * Generate component health summary
   */
  public getHealthSummary(): {
    overallStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    componentStatus: Record<string, 'excellent' | 'good' | 'fair' | 'poor' | 'critical'>;
    nextServiceDue: number; // timestamp
    estimatedServiceCost: number;
  } {
    const components = Array.from(this.componentDatabase.values());
    const overallHealth = this.calculateOverallHealth(components);

    const getStatusFromHealth = (health: number) => {
      if (health >= 90) return 'excellent';
      if (health >= 75) return 'good';
      if (health >= 60) return 'fair';
      if (health >= 30) return 'poor';
      return 'critical';
    };

    const componentStatus: Record<string, any> = {};
    components.forEach(comp => {
      componentStatus[comp.component] = getStatusFromHealth(comp.health);
    });

    const overallStatus = getStatusFromHealth(overallHealth);

    // Find next service due
    const nextServiceDue = Math.min(...components.map(c =>
      c.lastInspection + (c.estimatedLife * 60 * 60 * 1000) // Convert hours to ms
    ));

    // Estimate service cost
    const criticalComponents = components.filter(c => c.health < 30);
    const estimatedServiceCost = criticalComponents.reduce((sum, comp) =>
      sum + this.estimateMaintenanceCost(comp.component, 'critical'), 0
    );

    return {
      overallStatus,
      componentStatus,
      nextServiceDue,
      estimatedServiceCost
    };
  }
}

export default PredictiveMaintenanceSystem;