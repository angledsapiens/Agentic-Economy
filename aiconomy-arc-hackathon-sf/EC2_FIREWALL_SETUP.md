# EC2 Port 3001 Firewall Configuration

## Problem
The LIS server is running on EC2 but port 3001 is not accessible from the internet due to AWS Security Group rules.

## Solution: Open Port 3001 in AWS Console

### Steps to Configure Security Group

1. **Go to AWS Console**
   - Navigate to https://console.aws.amazon.com/ec2/
   - Sign in to your AWS account

2. **Find Your EC2 Instance**
   - Go to **EC2 Dashboard** → **Instances**
   - Find instance with IP `13.215.194.63`
   - Click on the **Instance ID**

3. **Edit Security Group**
   - Scroll down to **Security** tab
   - Click on the **Security Groups** link (e.g., `sg-xxxxx`)
   - This opens the Security Group details

4. **Add Inbound Rule for Port 3001**
   - Click **"Edit inbound rules"** button
   - Click **"Add rule"**
   - Configure the new rule:
     - **Type**: Custom TCP
     - **Port range**: 3001
     - **Source**:
       - Option 1 (Open to all): `0.0.0.0/0` (allows anyone)
       - Option 2 (Your IP only): Select "My IP" from dropdown
     - **Description**: LIS Backend Server
   - Click **"Save rules"**

5. **Test Connection**
   ```powershell
   curl http://13.215.194.63:3001/api/treasury
   ```

### Alternative: Using AWS CLI (if installed)

```bash
# Get your security group ID
aws ec2 describe-instances --filters "Name=ip-address,Values=13.215.194.63" --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" --output text

# Add rule (replace sg-xxxxx with your security group ID)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 3001 \
  --cidr 0.0.0.0/0
```

---

## Verification

After adding the security group rule, test from your local machine:

```powershell
# Test basic connectivity
curl http://13.215.194.63:3001/api/treasury

# Test all endpoints
curl http://13.215.194.63:3001/api/transactions
curl http://13.215.194.63:3001/api/activity
curl http://13.215.194.63:3001/agents
```

Expected response from `/api/treasury`:
```json
{
  "currency": "USDC",
  "totalBalance": "0",
  "reservedBalance": "0",
  "availableBalance": "0",
  "lastUpdated": "2026-01-19T...",
  "source": "postgresql"
}
```

---

## Current Server Status

The server IS running correctly on EC2:
- ✅ PM2 process active
- ✅ Listening on port 3001
- ✅ Responds to localhost requests
- ❌ Port 3001 blocked by Security Group (needs configuration above)

Once the Security Group is configured, the Observer UI can connect by updating:

**File**: `app/.env.local`
```bash
NEXT_PUBLIC_BACKEND_URL=http://13.215.194.63:3001
```

---

## Security Considerations

**For Production**:
- Consider using HTTPS instead of HTTP
- Use more restrictive IP ranges instead of `0.0.0.0/0`
- Set up a reverse proxy (nginx) with proper SSL certificates
- Use environment-specific security groups

**For Hackathon/Demo**:
- Opening to `0.0.0.0/0` (all IPs) is acceptable for testing
- Can restrict to your IP only if preferred
