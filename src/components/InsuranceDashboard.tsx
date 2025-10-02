import { useInsurance } from '../hooks/useInsurance';
import { InsurancePlanCard, InsurancePlanCardSkeleton } from './InsurancePlanCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Shield, 
  DollarSign, 
  TrendingDown, 
  Users,
  Heart,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const InsuranceDashboard = () => {
  const { plans, currentPlan, discount, isLoading, refreshData } = useInsurance();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Insurance Plans</h2>
              <p className="text-gray-600">Protect your health with our comprehensive plans</p>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <InsurancePlanCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Insurance Plans</h2>
              <p className="text-blue-700">Protect your health with our comprehensive coverage</p>
            </div>
          </div>
          <Button
            onClick={refreshData}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Current Plan Section */}
      {currentPlan && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900">Your Current Plan</h3>
              <p className="text-green-700">Active coverage protecting you</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Plan</span>
              </div>
              <p className="text-2xl font-bold text-green-800">{currentPlan.name}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Monthly Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-800">
                  ${currentPlan.discountedPremium?.toFixed(0) || currentPlan.premium}
                </p>
                {currentPlan.savings && currentPlan.savings > 0 && (
                  <Badge variant="default" className="bg-green-500">
                    ${currentPlan.savings.toFixed(0)} saved
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Coverage</span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                ${currentPlan.coverage.toLocaleString()}
              </p>
            </div>
          </div>

          {discount && discount.discountPercentage > 0 && (
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <div>
                  <h4 className="font-semibold text-green-900">
                    Active Discount: {discount.discountPercentage}%
                  </h4>
                  <p className="text-sm text-green-700">
                    You're saving ${currentPlan.savings?.toFixed(0) || 0} per month thanks to your healthy lifestyle!
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Discount Information */}
      {discount && discount.discountPercentage > 0 && !currentPlan && (
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-yellow-900">
                You've Earned a {discount.discountPercentage}% Discount!
              </h3>
              <p className="text-yellow-800">
                Your healthy activities have earned you savings on any plan you choose.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {currentPlan ? 'Other Available Plans' : 'Choose Your Plan'}
            </h3>
            <p className="text-gray-600">
              {currentPlan 
                ? 'Compare other options for your needs'
                : 'Select the perfect coverage for your health needs'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <InsurancePlanCard
              key={plan.id}
              plan={plan}
              isEnrolled={currentPlan?.plan_id === plan.id}
              showEnrollButton={!currentPlan || currentPlan.plan_id !== plan.id}
            />
          ))}
        </div>
      </div>

      {/* Information Section */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-bold mb-4">How to Maximize Your Savings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Stay Active</h4>
              <p className="text-sm text-gray-600">
                Exercise regularly to earn activity-based discounts up to 8%
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Annual Checkups</h4>
              <p className="text-sm text-gray-600">
                Get preventive care for an additional 3% discount
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Health Score</h4>
              <p className="text-sm text-gray-600">
                Maintain a high health score for up to 15% savings
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};