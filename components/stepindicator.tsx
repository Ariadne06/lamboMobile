import React from 'react';
import { View, Text} from 'react-native';

type Props = {
    currentStep: number;
    steps: string[];
};


export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }}
    >
      {steps.map((step, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;

        return (
          <React.Fragment key={index}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isCompleted
                    ? '#FF3D33'
                    : isActive
                    ? '#FF3D33'
                    : '#e5e7eb',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* Only show step number */}
                <Text
                  style={{
                    color: isCompleted || isActive ? 'white' : '#6b7280',
                    fontWeight: 'bold',
                  }}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={{
                  marginTop: 4,
                  color: isCompleted || isActive ? '#FF3D33' : '#6b7280',
                  fontSize: 12,
                }}
              >
                {step}
              </Text>
            </View>

            {/* Line between steps */}
            {index < steps.length - 1 && (
              <View
                style={{
                  height: 2,
                  width: 32,
                  backgroundColor: isCompleted ? '#FF3D33' : '#d1d5db',
                  marginHorizontal: 8,
                  alignSelf: 'center',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}