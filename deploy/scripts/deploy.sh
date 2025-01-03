#!/bin/bash
set -e

# Değişkenleri al
ENVIRONMENT=$1
VERSION=$2
NAMESPACE="runes-sdk-${ENVIRONMENT}"

# Kullanım kontrolü
if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
    echo "Usage: $0 <environment> <version>"
    echo "Example: $0 staging v1.0.0"
    exit 1
fi

# Ortam değişkenlerini kontrol et
if [ -z "$KUBECONFIG" ]; then
    echo "Error: KUBECONFIG environment variable is not set"
    exit 1
fi

# Helm değerlerini belirle
VALUES_FILE="deploy/helm/values-${ENVIRONMENT}.yaml"
if [ ! -f "$VALUES_FILE" ]; then
    echo "Error: Values file not found: $VALUES_FILE"
    exit 1
fi

# Create namespace (if not exists)
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Helm chart'ı güncelle
echo "Deploying runes-sdk to ${ENVIRONMENT} environment..."
helm upgrade --install \
    --namespace $NAMESPACE \
    --values $VALUES_FILE \
    --set image.tag=$VERSION \
    --set environment=$ENVIRONMENT \
    runes-sdk \
    deploy/helm/runes-sdk

# Deployment'ı bekle
echo "Waiting for deployment to complete..."
kubectl rollout status deployment/runes-sdk -n $NAMESPACE

# Sağlık kontrolü
echo "Checking application health..."
HEALTH_CHECK_URL=$(kubectl get svc -n $NAMESPACE runes-sdk -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')/health
for i in {1..30}; do
    if curl -s $HEALTH_CHECK_URL > /dev/null; then
        echo "Application is healthy!"
        exit 0
    fi
    echo "Waiting for application to become healthy... ($i/30)"
    sleep 10
done

echo "Error: Application health check failed"
exit 1 