import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const StatCard = React.memo(({ title, value, color = 'primary.main', isDarkMode }) => (
    <Card sx={{
        height: '100%',
        background: isDarkMode
            ? 'rgba(45, 55, 72, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: isDarkMode
                ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                : '0 12px 40px rgba(0, 0, 0, 0.15)',
        }
    }}>
        <CardContent sx={{ p: 3 }}>
            <Typography
                color="text.secondary"
                gutterBottom
                sx={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="h4"
                component="div"
                sx={{
                    fontWeight: 700,
                    fontSize: '2rem',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                }}
            >
                {value}
            </Typography>
        </CardContent>
    </Card>
));

export default StatCard;
