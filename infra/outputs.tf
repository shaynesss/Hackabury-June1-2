output "public_ip" {
  description = "Elastic IP address of the EC2 instance"
  value       = aws_eip.web.public_ip
}

output "web_url" {
  description = "URL of the deployed frontend"
  value       = "http://${aws_eip.web.public_ip}"
}

output "ssh_command" {
  description = "Command to SSH into the instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.web.public_ip}"
}
