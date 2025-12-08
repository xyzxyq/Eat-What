import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = process.env.EMAIL_FROM || 'Eat_What <noreply@eat-what.fun>'

/**
 * 生成6位数字验证码
 */
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 发送邮箱验证码
 */
export async function sendVerificationEmail(
    to: string,
    code: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: [to],
            subject: '🔐 Eat_What 邮箱验证码',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FFD21E 0%, #FFE066 100%); padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">💕</div>
            <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 700;">Eat_What</h1>
            <p style="margin: 8px 0 0; color: #4a4a4a; font-size: 14px;">情侣私密日记</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                你好！👋<br><br>
                你正在绑定邮箱到 Eat_What，请使用以下验证码完成验证：
            </p>
            
            <!-- Code Box -->
            <div style="background: #f8f9fa; border: 2px dashed #FFD21E; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: 'Courier New', monospace;">
                    ${code}
                </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                ⏰ 验证码有效期 <strong>10分钟</strong><br>
                🔒 如果这不是你的操作，请忽略此邮件
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
                Made with 💛 for couples<br>
                © ${new Date().getFullYear()} Eat_What
            </p>
        </div>
    </div>
</body>
</html>
            `,
        })

        if (error) {
            console.error('Send email error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Send email exception:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '邮件发送失败'
        }
    }
}

/**
 * 通知类型
 */
export type NotificationType = 'new_moment' | 'new_comment' | 'wish_update'

interface NotificationData {
    type: NotificationType
    partnerName: string      // 伴侣名称
    recipientName: string    // 收件人名称
    content?: string         // 内容摘要
    wishTitle?: string       // 心愿标题（仅心愿更新时使用）
}

/**
 * 发送伴侣动态通知邮件
 */
export async function sendPartnerNotification(
    to: string,
    data: NotificationData
): Promise<{ success: boolean; error?: string }> {
    const { type, partnerName, recipientName, content, wishTitle } = data

    // 根据通知类型生成标题和内容
    let subject = ''
    let mainMessage = ''
    let emoji = ''

    switch (type) {
        case 'new_moment':
            emoji = '📝'
            subject = `💕 ${partnerName} 发布了新日记`
            mainMessage = `<strong>${partnerName}</strong> 刚刚在 Eat_What 发布了一条新日记：`
            break
        case 'new_comment':
            emoji = '💬'
            subject = `💕 ${partnerName} 评论了你的日记`
            mainMessage = `<strong>${partnerName}</strong> 在你的日记下留言了：`
            break
        case 'wish_update':
            emoji = '✨'
            subject = `💕 ${partnerName} 更新了心愿清单`
            mainMessage = `<strong>${partnerName}</strong> 在「我们想做的事」中添加了新心愿：`
            break
    }

    const displayContent = content
        ? (content.length > 100 ? content.slice(0, 100) + '...' : content)
        : wishTitle || ''

    try {
        const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: [to],
            subject,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FFD21E 0%, #FFE066 100%); padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">${emoji}</div>
            <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 700;">Eat_What</h1>
            <p style="margin: 8px 0 0; color: #4a4a4a; font-size: 14px;">情侣私密日记</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                亲爱的 ${recipientName}，👋
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                ${mainMessage}
            </p>
            
            ${displayContent ? `
            <!-- Content Preview -->
            <div style="background: #f8f9fa; border-left: 4px solid #FFD21E; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                    "${displayContent}"
                </p>
            </div>
            ` : ''}
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                快去看看吧~ 💕
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 24px;">
                <a href="https://eat-what.fun/timeline" 
                   style="display: inline-block; background: linear-gradient(135deg, #FFD21E 0%, #FFB800 100%); color: #1a1a1a; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    打开 Eat_What
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
                Made with 💛 for couples<br>
                © ${new Date().getFullYear()} Eat_What
            </p>
            <p style="margin: 8px 0 0; color: #bbb; font-size: 11px;">
                如不想接收此类通知，请在设置中关闭邮件提醒
            </p>
        </div>
    </div>
</body>
</html>
            `,
        })

        if (error) {
            console.error('Send notification error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Send notification exception:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '通知发送失败'
        }
    }
}
