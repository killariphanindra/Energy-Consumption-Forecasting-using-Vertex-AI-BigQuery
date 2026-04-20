from google.cloud import aiplatform

# Replace these with your actual details
PROJECT_ID = "certain-tangent-475514-p8"
LOCATION = "us-central1"  # or the region where your model is deployed
ENDPOINT_ID = "9051609628898492416"  # found in Vertex AI console

# Initialize Vertex AI client
aiplatform.init(project=PROJECT_ID, location=LOCATION)

# Connect to endpoint
endpoint = aiplatform.Endpoint(endpoint_name=f"projects/{PROJECT_ID}/locations/{LOCATION}/endpoints/{ENDPOINT_ID}")

# Example prediction input
instance = {"feature1": 1.5, "feature2": 3.2}  # adjust keys to match your model

# Send prediction request
response = endpoint.predict(instances=[instance])

# Print result
print("Prediction response:")
print(response)
